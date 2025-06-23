import HomePageInput from "@/components/home-page-input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="w-2/3 h-full flex flex-col justify-center items-center">
        <div className="text-4xl text-black mb-4 font-light">
          <span className="text-primary">m</span>
          ere<span className="text-primary">d</span>ith
        </div>
        <HomePageInput />
      </div>
      <div className="h-10 flex justify-center items-center">
        <Dialog>
          <DialogTrigger className="mb-12">
            <div className="w-full h-full rounded-lg hover:border hover:border-black cursor-pointer text-xs p-4 font-light">
              Advertiser? Open the portal.
              <ExternalLink className="inline ml-2" size={12} />
            </div>
          </DialogTrigger>
          <DialogContent>
            <Link
              href="/analytics/pfizer"
              className="w-full mt-2 flex items-center justify-start p-2 hover:bg-gray-100 rounded-md"
            >
              Pfizer
            </Link>
            <Link
              href="/analytics/genentech"
              className="w-full mt-2 h-10 flex items-center justify-start p-2 hover:bg-gray-100 rounded-md"
            >
              Genentech
            </Link>
            <Link
              href="/analytics/gsk"
              className="w-full mt-2 h-10 flex items-center justify-start p-2 hover:bg-gray-100 rounded-md"
            >
              GSK
            </Link>
            <Link
              href="/analytics/eli-lilly"
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
