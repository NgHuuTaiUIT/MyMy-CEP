import { useEffect, useRef, useState } from "react";
import { os, path, fs } from "../lib/cep/node";
import { evalTS } from "../lib/utils/bolt";
import "./main.scss";

const Main = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showActionButtons, setShowActionButtons] = useState<boolean>(false);

  async function downloadFile(folderPath: string, url: string, outputPath: string, callback?: () => void): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        headers: {
          'accept': 'application/octet-stream',
        }
      });
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      await fs.writeFileSync(`${folderPath}/${outputPath}`, buffer);
      const isExisted = await fs.existsSync(`${folderPath}/${outputPath}`);
      if (!isExisted) {
        throw new Error('File not found');
      }
      const result = await evalTS("importFileToPremiere", `${folderPath}/${outputPath}`);
      return result;
    }
    catch (error) {
      alert(error);
    }
  }

  function sendMsgToChild(msg: any, targetOrigin = '*') {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(msg, targetOrigin);
    }
  }

  async function receiveSelectedItem(e: MessageEvent) {
    if (e.data.action === 'SELECTED_ITEMS') {
      sendActionClearSelectedItem();
      const folderPath = await evalTS("getFolderSelect")
      if (!folderPath) return;

      if (e.data.payload?.length > 0) {
        Promise.all(
          e.data.payload?.map(async ({ url, title }: any) => {
            const result = await downloadFile(folderPath, url, title);
            return result;
          })
        ).finally(() => {
          alert("Completed!");
        });
      }
    }
  }

  function receiveStatusLogin(e: MessageEvent) {
    e.origin
    if (e.data.action === 'LOGINED') {
      setShowActionButtons(true);
    }
  }

  function receiveMsgFromChild(e: MessageEvent) {
    receiveSelectedItem(e);
    receiveStatusLogin(e);
  }

  function sendActionSelectedItem() {
    const data = {
      action: 'SELECTED_ITEMS',
      payload: null
    }
    sendMsgToChild(data);
  }

  function sendActionClearSelectedItem() {
    const data = {
      action: 'CLEAR_SELECTED_ITEMS',
    }
    sendMsgToChild(data);
  }

  async function sendActionUpload() {
    let presetPath = `preset/Match Source - Adaptive High Bitrate.epr`;
    let outPreset = path.join(window.cep_node.global.__dirname, presetPath)
    try {
      const res = await evalTS("exportAndUploadSequence", outPreset);
      if (!res?.success) {
        alert(res?.message || 'Unknown error!');
        return;
      };
      const fileUpload = await fs.readFileSync(res.data.path);
      if (res.success) {
        const data = {
          action: 'UPLOAD_MEDIA',
          payload: {
            file: fileUpload,
            name: 'Adobe_' + res.data.name
          }
        }
        sendMsgToChild(data);
      }
    } catch (error) {
      alert(error);
    }
  }

  function onLoad() {
    const data = {
      action: 'INIT',
      value: 'hello'
    }
    sendMsgToChild(data);
  }

  useEffect(() => {
    if (window.cep) {
      console.log(window.cep)
    }

    window.addEventListener('message', receiveMsgFromChild);

    return () => {
      window.removeEventListener('message', receiveMsgFromChild);
    }
  }, []);

  return (
    <div className="app">
      <iframe ref={iframeRef} onLoad={onLoad} src="http://localhost:3000" frameBorder="0"></iframe>
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
