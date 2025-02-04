import { UploadDropzone } from "@/lib/uploadthing";
import { Json } from "@uploadthing/shared";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";

type Props = {
  onChange: (urls: string[]) => void;
  type: "imageUploader" | "file";
};

export default function uploader({ type, onChange }: Props) {
  return (
    <UploadDropzone
      endpoint={type}
      onClientUploadComplete={(res) => onChange(res.map((item) => item.url))}
      onUploadError={(error: UploadThingError<Json>) => {
        toast.error(error.message);
      }}
    />
  );
}
