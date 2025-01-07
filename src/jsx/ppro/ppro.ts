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
  return selectedFolder.fsName;
}

export function importFileToPremiere(filePath: string) {
  var project = app.project;
  var importResult = project.importFiles([filePath], true, project.getInsertionBin(), false);

  if (importResult) {
    alert('File imported successfully!');
  } else {
    alert('Failed to import file.');
  }
  // Creating Bins
  // var audioBin = project.rootItem.createBin("Audio");
  // var videoBin = project.rootItem.createBin("Video");
  // var pictureBin = project.rootItem.createBin("Picture");
  // var otherBin = project.rootItem.createBin("Other");

  // var audioFiles = [];
  // var videoFiles = [];
  // var pictureFiles = [];
  // var otherFiles = [];

  // for (var i = 0; i < files.length; i++) {
  //   var file = files[i];
  //   if (file instanceof File) {
  //     var fsName = file.fsName;
  //     var splitted = fsName.split(".");
  //     splitted.reverse();
  //     var fileExtension = splitted[0].toLowerCase();

  //     switch (fileExtension) {
  //       case "mov":
  //         videoFiles.push(fsName);
  //         break;
  //       case "jpg":
  //       case "png":
  //         pictureFiles.push(fsName);
  //         break;
  //       case "mp3":
  //         audioFiles.push(fsName);
  //         break;
  //       default:
  //         otherFiles.push(fsName);
  //     }
  //   }
  // }

  // if (videoFiles.length > 0) {
  //   project.importFiles(videoFiles, true, videoBin, false);
  // }
  // if (pictureFiles.length > 0) {
  //   project.importFiles(pictureFiles, true, pictureBin, false);
  // }
  // if (audioFiles.length > 0) {
  //   project.importFiles(audioFiles, true, audioBin, false);
  // }
  // if (otherFiles.length > 0) {
  //   project.importFiles(otherFiles, true, otherBin, false);
  // }

}

export function exportAndUploadSequence(outputPath: string, presetPath: string) {
  var sequence = app.project.activeSequence;
  if (sequence) {
      var jobID = sequence.exportAsMediaDirect(
          outputPath,        // Destination path for export
          presetPath,        // Path to export preset
          app.encoder.ENCODE_WORKAREA,
      );
  } else {
      return "No active sequence to export.";
  }
}
