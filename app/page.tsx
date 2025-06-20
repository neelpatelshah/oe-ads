import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";

const Page = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-1/2 h-full flex justify-center items-center bg-white border-primary border-8">
        <p className="text-3xl text-primary font-bold">
          <Link href="/ask">ASK</Link>
        </p>
      </div>
      <div className="w-1/2 h-full flex justify-center items-center bg-primary border-white border-8">
        <Dialog>
          <DialogTrigger className="text-3xl text-white font-bold hover:cursor-pointer">
            ANALYTICS
          </DialogTrigger>
          <DialogContent>
            <Link
              href="/analytics?co=pfizer"
              className="w-full mt-2 flex items-center justify-start p-2 hover:bg-gray-100 rounded-md"
            >
              Pfizer
            </Link>
            <Link
              href="/analytics?co=genentech"
              className="w-full mt-2 h-10 flex items-center justify-start p-2 hover:bg-gray-100 rounded-md"
            >
              Genentech
            </Link>
            <Link
              href="/analytics?co=gsk"
              className="w-full mt-2 h-10 flex items-center justify-start p-2 hover:bg-gray-100 rounded-md"
            >
              GSK
            </Link>
            <Link
              href="/analytics?co=eli-lilly"
              className="w-full mt-2 h-10 flex items-center justify-start p-2 hover:bg-gray-100 rounded-md"
            >
              Eli Lilly
            </Link>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Page;
