import readline from "node:readline/promises";
import { pipe, object, parse, string, regex, array, optional } from "valibot";
import Table from "cli-table3";
import type { InferOutput } from "valibot";
import { env } from "./env.js";

const UserSchema = object({
  name: string(),
  targetClock: pipe(
    string(),
    regex(
      /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}$/,
      "Invalid time format. Expected HH:MM:SS.mmm"
    )
  ),
  username: string(),
  password: string(),
});

const UsersSchema = object({
  users: array(UserSchema),
  excludes: optional(array(string())),
});

export type User = InferOutput<typeof UserSchema>;
export type Users = InferOutput<typeof UsersSchema>;

async function fetchBinData(binID: string, apiKey: string) {
  const url = `https://api.jsonbin.io/v3/b/${binID}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Key": apiKey,
        "X-Bin-Meta": "false",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching data");
    }

    const binData = await response.json();
    return parse(UsersSchema, binData);
  } catch (error) {
    console.error("An error occurred");
  }
}

const table = new Table({
  head: ["ID", "Name", "Time"],
  colWidths: [5, 30, 14],
});

export async function selectAccount() {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const users = await fetchBinData(env.binID, env.ApiKey);

    if (!users) {
      throw new Error("users not found");
    }

    const includedUsers = users.users.filter(
      (user) => !users.excludes?.includes(user.name)
    );

    includedUsers.forEach((account, index) =>
      table.push([index + 1, account.name, account.targetClock])
    );
    console.log(table.toString());

    const accountID = await rl.question("Please enter account ID: ");
    rl.close();

    return includedUsers[Number(accountID) - 1];
  } catch (error) {
    console.log(error);
    process.exit();
  }
}
