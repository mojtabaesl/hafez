import {
  custom,
  object,
  number,
  parse,
  boolean,
  pipe,
  string,
  nonEmpty,
} from "valibot";
import type { InferOutput } from "valibot";

const EnvSchema = object({
  checkTimeInterval: number(),
  headlessMode: boolean(),
  screenWidth: number(),
  screenHeight: number(),
  sendButtonClickCount: number(),
  warmupOffset: pipe(
    number(),
    custom(
      (value) =>
        typeof value === "number" ? value === 0 || value >= 2 : false,
      "warmupOffset must be 0 or >= 2"
    )
  ),
  ApiKey: pipe(string(), nonEmpty("Please enter api key")),
  binID: pipe(string(), nonEmpty("Please enter bin ID")),
});

export type ENV = InferOutput<typeof EnvSchema>;

function getEnv(): ENV {
  try {
    const envObject = {
      checkTimeInterval: Number(process.env?.CHECK_TIME_INTERVAL ?? 1),
      headlessMode: process.env?.HEADLESS_MODE === "true" ? true : false,
      screenWidth: Number(process.env?.SCREEN_WIDTH ?? 1920),
      screenHeight: Number(process.env?.SCREEN_HEIGHT ?? 1080),
      sendButtonClickCount: Number(process.env?.SEND_BUTTON_CLICK_COUNT ?? 1),
      warmupOffset: Number(process.env.WARMUP_OFFSET ?? 0),
      ApiKey: process.env.API_KEY,
      binID: process.env.BIN_ID,
    };
    return parse(EnvSchema, envObject);
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
}

export const env = getEnv();