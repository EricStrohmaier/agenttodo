export const tryParseJson = (jsonString: any) => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    return undefined;
  }
};

export function formatDateForDB(date: Date) {
  if (isNaN(date.getTime())) {
    console.log("Error at formatDateForDB input:", date);
    return null;
  }

  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}
