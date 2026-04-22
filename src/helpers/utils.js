import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

//TO TRIM SPACES AND CHECK IF AN INPUT FIELD IS EMPTY
export const isEmpty = (text) => {
  if (text === null || text === undefined) return true;
  return String(text).trim() === "";
};

export const toSentenceCase = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);
export const toCapitalize = (string) =>
  string.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());

export const isValidEmail = (email) => {
  // Regular expression pattern for validating email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phoneNumber) => {
  // Regular expression pattern for validating phone numbers
  const phoneRegex = /^\d{11}$/; // Assumes 10 digits format
  return phoneRegex.test(phoneNumber);
};

export const exportToExcel = (data, fileName) => {
  // Create a new workbook and add a worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write the workbook and create a Blob from the data
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // Save the file
  saveAs(dataBlob, `${fileName}.xlsx`);
};
