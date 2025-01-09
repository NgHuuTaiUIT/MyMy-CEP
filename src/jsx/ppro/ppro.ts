import {
  helloVoid,
  helloError,
  helloStr,
  helloNum,
  helloArrayStr,
  helloObj,
} from "../utils/samples";
export { helloError, helloStr, helloNum, helloArrayStr, helloObj, helloVoid };
import { dispatchTS } from "../utils/utils";

export const qeDomFunction = () => {
  if (typeof qe === "undefined") {
    app.enableQE();
  }
  if (qe) {
    qe.name;
    qe.project.getVideoEffectByName("test");
  }
};

export const helloWorld = () => {
  alert("Hello from Premiere Pro.");
};

export function getFolderSelect() {
  var selectedFolder = Folder.selectDialog();
  return selectedFolder.fsName ?? '';
}

export function importFileToPremiere(filePath: string) {
  var project = app.project;
  var importResult = project.importFiles([filePath], true, project.getInsertionBin(), false);
  return importResult
}

export function exportAndUploadSequence(presetPath: string): any {
  var selectedFolder = Folder.selectDialog();
  if (!selectedFolder) {
    throw new Error("No folder selected.");
  }
  var sequence = app.project.activeSequence;
  if (sequence) {
    var firstClip = sequence.videoTracks[0].clips[0];
    var originalExtension = "mp4"; // Default if not found
    if (firstClip && firstClip.projectItem) {
      var filePath = firstClip.projectItem.getMediaPath();
      originalExtension = filePath.split('.').pop() ?? 'mp4';
    }
    var outPath = selectedFolder.fsName.toString() + '\\' + sequence.name.toString() + '.' + originalExtension.toString();

    var outFilePath = new File(decodeURI(outPath));
    var outPreset = new File(decodeURI(presetPath));

    var res = sequence.exportAsMediaDirect(
      outFilePath.fsName,        // Destination path for export
      outPreset.fsName,        // Path to export preset
      app.encoder.ENCODE_ENTIRE,
    );
    var result: any = { success: false, msg: '', data: null };
    if (res === 'No Error') {
      result.success = true;
      result.msg = 'Success';
      result.data = { path: outFilePath.fsName, name: sequence.name.toString() + '.' + originalExtension.toString() };
    } else {
      result.msg = res;
    }
    return result;
  } else {
    throw new Error("No active sequence to export.");
  }
}