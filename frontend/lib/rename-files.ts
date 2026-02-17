import { v4 as uuidv4 } from "uuid";

export function renameFiles(files: File[]) {
  return files.map((file) => {
    const ext = file.name.split(".").pop();
    const newFileName = `${uuidv4()}.${ext}`;
    return new File([file], newFileName, { type: file.type });
  });
}
