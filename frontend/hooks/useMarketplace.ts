import {decrypt, encrypt} from "@/services/seal";
import {fetchBlobFromWalrus, uploadFileToWalrus} from "@/services/walrus";
import {useState} from "react";

export default function useMarketplace() {
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file: File) => {
    setLoading(true);
    try {
      const encryptedBytes = await encrypt(
        new Uint8Array(await file.arrayBuffer())
      );
      const blobId = await uploadFileToWalrus(encryptedBytes, file.name);
      return blobId;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFile = async (
    blobId: string,
    filename: string,
    filetype: string
  ) => {
    setLoading(true);
    try {
      const encryptedBytes = await fetchBlobFromWalrus(blobId);
      const decryptedBytes = await decrypt(encryptedBytes);
      const Uint8ArrayBytes = new Uint8Array(decryptedBytes);
      const file = new File([Uint8ArrayBytes], filename, {type: filetype});
      return file;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    uploadFile,
    getFile,
  };
}
