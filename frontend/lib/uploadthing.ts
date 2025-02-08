import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

import type { OurFileRouter } from "@/frontend/app/api/uploadthing/core";

// https://docs.uploadthing.com/getting-started/appdir
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
