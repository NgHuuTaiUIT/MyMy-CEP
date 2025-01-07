import { useEffect, useRef, useState } from "react";
import { os, path, fs } from "../lib/cep/node";
import {
  csi,
  evalES,
  evalFile,
  openLinkInBrowser,
  subscribeBackgroundColor,
  evalTS,
} from "../lib/utils/bolt";

import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";
import tsLogo from "../assets/typescript.svg";
import sassLogo from "../assets/sass.svg";

import nodeJs from "../assets/node-js.svg";
import adobe from "../assets/adobe.svg";
import bolt from "../assets/bolt-cep.svg";
import "./main.scss";

const Main = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const nodeTest = () => {
    alert(
      `Node.js ${process.version}\nPlatform: ${os.platform
      }\nFolder: ${path.basename(window.cep_node.global.__dirname)}`
    );
  };

  async function downloadFile(url: string, outputPath: string, callback?: () => void) {
    try {
      const folder = await evalTS("getFolderSelect")
      const response = await fetch(url);
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      await fs.writeFileSync(`${folder}/${outputPath}`, buffer);
      await evalTS("importFileToPremiere", `${folder}/${outputPath}`);
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

  function receiveMsgFromChild(e: MessageEvent) {
    console.log(e.data);
    receiveSelectedItem(e);
  }

  function receiveSelectedItem(e: MessageEvent) {
    if (e.data.action === 'SELECTED_ITEMS') {
      console.log(e.data.payload);
      const firstItem = e.data.payload[0];
      downloadFile(firstItem.url, firstItem.title)
    }
  }

  function sendActionSelectedItem() {
    const data = {
      action: 'SELECTED_ITEMS',
      payload: null
    }
    sendMsgToChild(data);
  }

  async function sendActionUpload() {
    const data = {
      action: 'UPLOAD_MEDIA_TO_MYMY',
      payload: null
    }
    const folder = await evalTS("getFolderSelect")

    await evalTS("exportAndUploadSequence", `${folder}`, `${folder}`);
    
  }

  function onLoad() {
    const data = {
      action: 'init',
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
      <iframe ref={iframeRef} onLoad={onLoad} src="http://192.168.1.10:3001" frameBorder="0"></iframe>
      <div className="wrap-button">
        <button onClick={sendActionSelectedItem}>Import From MyMy
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 14a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 0-2 0v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-4a1 1 0 0 0-1-1m-9.71 1.71a1 1 0 0 0 .33.21a.94.94 0 0 0 .76 0a1 1 0 0 0 .33-.21l4-4a1 1 0 0 0-1.42-1.42L13 12.59V3a1 1 0 0 0-2 0v9.59l-2.29-2.3a1 1 0 1 0-1.42 1.42Z" /></svg>
        </button>
        <button onClick={sendActionUpload}>Export To MyMy
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.71 7.71L11 5.41V15a1 1 0 0 0 2 0V5.41l2.29 2.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-4-4a1 1 0 0 0-.33-.21a1 1 0 0 0-.76 0a1 1 0 0 0-.33.21l-4 4a1 1 0 1 0 1.42 1.42M21 14a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 0-2 0v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-4a1 1 0 0 0-1-1" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Main;
