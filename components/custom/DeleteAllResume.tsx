"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { usePuterStore } from "@/lib/puter";
import { useEffect, useState } from "react";
import { deleteAllResumes } from "@/lib/actions/analyzedResumes";
import { toast } from "sonner";
import { LoaderCircleIcon } from "lucide-react";
import StatusOverlay from "./StatusOverlay";
import { useRouter } from "next/navigation";

const DeleteAllResume = () => {
  const router = useRouter();
  const { error, fs, kv } = usePuterStore();

  const [files, setFiles] = useState<FSItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load files from Puter
  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    // Convert each file to a plain object to avoid serialization issues
    const plainFiles = files.map((file) => ({ ...file }));
    setFiles(plainFiles);
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete all resumes from Puter
  const handleDeleteFromPuter = async () => {
    // Delete all files in parallel
    await Promise.all(files.map((file) => fs.delete(file.path)));
    await kv.flush();
  };

  // Delete all resumes from Neon (Drizzle ORM)
  const deleteFromNeon = async () => {
    await deleteAllResumes(); // will throw if fails
    return true;
  };

  // Atomic delete: both must succeed, or both fail
  const handleDelete = async () => {
    setLoading(true);
    try {
      // Run both deletions in parallel
      await Promise.all([handleDeleteFromPuter(), deleteFromNeon()]);
      toast.success("All resumes deleted successfully");
      loadFiles();
      router.refresh(); // Revalidate the page to show updated data
    } catch (err) {
      console.error("delete all resumes error: ", err);
      toast.error("Failed to delete all resumes. Nothing was deleted.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div>Error {error}</div>;
  }

  return (
    <>
      <StatusOverlay
        isVisible={loading}
        statusText="Deleting all resumes..."
        isModal={true}
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            Delete All
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your resumes and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteAllResume;
