import { Suspense, useEffect, useRef, useState } from "react";
import { os, path, fs } from "../lib/cep/node";
import { evalTS } from "../lib/utils/bolt";
import "./main.scss";
import initJson from '../assets/init.config.json';
import { createDefaultFileAndFolder, downloadFile } from "../utils";
import { ReceiveAction, SendService } from "../actions";

type ConfigType = {
  url: {
    host: string;
    path: string;
  };
  token: string;
  preset: {
    render: {
      path: string
      extension: string
      render_type: number
    }
  },
  export: {
    defaultPath: string
  },
  import: {
    defaultPath: string
  }
}
const Main = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showActionButtons, setShowActionButtons] = useState<boolean>(false);
  const [config, setConfig] = useState<ConfigType | null>(null);

  async function receiveSelectedItem(e: MessageEvent) {
    if (e.data.action === ReceiveAction.SELECTED_ITEMS) {
      sendActionClearSelectedItem();
      let folderPath = await evalTS("getFolderSelect")
      folderPath = folderPath || config?.import.defaultPath
      if (!folderPath) return;

      if (e.data.payload?.length > 0) {
        const arrPromise = e.data.payload?.map(({ url, title }: any) =>
          downloadFile(folderPath, url, title)
        )
        Promise.all(
          arrPromise
        ).finally(() => {
          alert("Completed!");
        });
      }
    }
  }

  function receiveStatusLogin(e: MessageEvent) {
    if (e.data.action === ReceiveAction.LOGINED) {
      setShowActionButtons(true);
      // if (config) {
      //   const newData = { ...config, token: e.data.payload.token as string }
      //   setConfig(newData)
      //   changeFileConfig(JSON.stringify(newData))
      // }
    }
  }

  function receiveMsgFromChild(e: MessageEvent) {
    receiveSelectedItem(e);
    receiveStatusLogin(e);
  }

  function sendMsgToChild(msg: any, targetOrigin = 'http://localhost:3001') {
    if (iframeRef.current) {
      const origin = config?.url.host ?? targetOrigin
      iframeRef.current.contentWindow?.postMessage(msg, origin);
    }
  }

  function sendActionSelectedItem() {
    sendMsgToChild(SendService.getSelectedItems());
  }

  function sendActionClearSelectedItem() {
    sendMsgToChild(SendService.clearSelectedItems());
  }

  async function sendActionUpload() {
    if (!config) return;
    let presetPath = config?.preset.render.path;
    if (!presetPath) {
      alert('Preset path is not found!');
      return;
    };

    let outPreset = path.join(window.cep_node.global.__dirname, presetPath)
    let folderPath = await evalTS("getFolderSelect")
    folderPath = folderPath || config?.export.defaultPath
    try {
      const res = await evalTS("exportAndUploadSequence", folderPath, decodeURI(outPreset), config.preset.render.extension, config.preset.render.render_type);
      if (!res?.success) {
        alert(res?.message || 'Unknown error!');
        return;
      };
      const fileUpload = await fs.readFileSync(res.data.path);
      if (res.success) {
        sendMsgToChild(SendService.uploadMedia({
          file: fileUpload,
          name: 'Adobe_' + res.data.name
        }));
      }
    } catch (error) {
      alert(error);
    }
  }

  function onLoad() {
    sendMsgToChild(SendService.init({
      token: config?.token
    }));
  }

  async function initConfig() {
    const documentsPath = path.join(os.homedir(), 'Documents', 'Adobe', 'MyMy');
    const initPath = path.join(documentsPath, 'init.config.json');
    let config;
    if (fs.existsSync(initPath)) {
      const data = await fs.readFileSync(initPath, 'utf-8');
      config = JSON.parse(data)
    } else {
      config = await createDefaultFileAndFolder()
    }
    setConfig(config)
  }

  useEffect(() => {
    if (window.cep) {
      console.log(window.cep)
    }
    initConfig();
    window.addEventListener('message', receiveMsgFromChild);
    return () => {
      window.removeEventListener('message', receiveMsgFromChild);
    }
  }, [config]);

  return (
    <div className="app">
      {config?.url && <iframe ref={iframeRef} onLoad={onLoad} src={config.url.host + config.url.path} frameBorder="0"></iframe>}
      {showActionButtons && <div className="wrap-button">
        <button onClick={sendActionSelectedItem}>Import From MyMy
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 14a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 0-2 0v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-4a1 1 0 0 0-1-1m-9.71 1.71a1 1 0 0 0 .33.21a.94.94 0 0 0 .76 0a1 1 0 0 0 .33-.21l4-4a1 1 0 0 0-1.42-1.42L13 12.59V3a1 1 0 0 0-2 0v9.59l-2.29-2.3a1 1 0 1 0-1.42 1.42Z" /></svg>
        </button>
        <button onClick={sendActionUpload}>Export To MyMy
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.71 7.71L11 5.41V15a1 1 0 0 0 2 0V5.41l2.29 2.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-4-4a1 1 0 0 0-.33-.21a1 1 0 0 0-.76 0a1 1 0 0 0-.33.21l-4 4a1 1 0 1 0 1.42 1.42M21 14a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 0-2 0v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-4a1 1 0 0 0-1-1" /></svg>
        </button>
      </div>}
    </div>
  );
};

export default Main;
