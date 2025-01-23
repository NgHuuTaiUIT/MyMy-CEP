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
  return selectedFolder ? selectedFolder.fsName : '';
}

export function importFileToPremiere(filePath: string) {
  var project = app.project;
  var importResult = project.importFiles([filePath], true, project.getInsertionBin(), false);
  return importResult
}

export function exportAndUploadSequence(folderPath: string, presetPath: string, extension: string, type: number): any {
  var sequence = app.project.activeSequence;
  if (sequence) {
    var outPath = folderPath + '\\' + sequence.name.toString() + '.' + extension;

    var outFilePath = new File(decodeURI(outPath));
    var outPreset = new File(decodeURI(presetPath));

    var res = sequence.exportAsMediaDirect(
      outFilePath.fsName,        // Destination path for export
      outPreset.fsName,        // Path to export preset
      Number(type),
    );
    var result: any = { success: false, msg: '', data: null };
    if (res === 'No Error') {
      result.success = true;
      result.msg = 'Success';
      result.data = { path: outFilePath.fsName, name: sequence.name.toString() + '.' + extension };
    } else {
      result.msg = res;
    }
    return result;
  } else {
    throw new Error("No active sequence to export.");
  }
}