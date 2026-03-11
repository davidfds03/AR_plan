/**
 * PlanPro Storage Handler
 * Uses the specific Parent Folder ID provided to sort files.
 */

const PARENT_FOLDER_ID = "1Qok_XpqP6oH03VTB94rfFCG_9-wd4AcN";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const filename = data.filename;
    const mimeType = data.mimeType;
    let base64Data = data.file;

    // Remove Base64 Data URL prefix if present
    const base64Index = base64Data.indexOf(';base64,');
    if (base64Index > -1) {
      base64Data = base64Data.substring(base64Index + 8);
    }

    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, mimeType, filename);

    // 1. Get the Main Folder by ID
    let mainFolder;
    try {
      mainFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    } catch (fErr) {
      // Fallback: If ID fails, look for "planpro" folder as backup
      const search = DriveApp.getFoldersByName("planpro");
      mainFolder = search.hasNext() ? search.next() : DriveApp.createFolder("planpro");
    }

    // 2. Identify Target Subfolder
    let subfolderName = "General_Uploads";
    if (mimeType.includes("model") || filename.endsWith(".glb")) {
      subfolderName = "3D_Models";
    } else if (filename.startsWith("Preview_")) {
      subfolderName = "Room_Previews";
    } else if (filename.startsWith("Source_")) {
      subfolderName = "AI_Uploads";
    }

    // 3. Get or Create Subfolder inside Main Folder
    let targetFolder;
    const subSearch = mainFolder.getFoldersByName(subfolderName);
    if (subSearch.hasNext()) {
      targetFolder = subSearch.next();
    } else {
      targetFolder = mainFolder.createFolder(subfolderName);
    }

    // 4. Save the file
    const file = targetFolder.createFile(blob);

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Saved to " + subfolderName,
      fileId: file.getId()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}