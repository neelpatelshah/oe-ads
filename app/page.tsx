import HomePageInput from "@/components/home-page-input";
import Logo from "@/components/logo";
import { SponsoredQuestions } from "@/components/sponsored-questions";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { MockAdDB } from "@/app/data/mockdb";

const Page = () => {
  const companies = MockAdDB.listCompanies();
  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center">
      <div className="absolute top-0 w-full bg-primary/20 p-4 text-center text-sm text-gray-800 shadow-sm">
        Meredith has signed content agreements with JAMA and The New England
        Journal of Medicine.
      </div>
      <div className="w-2/3 h-full flex flex-col justify-center items-center">
        <Logo />
        <p className="text-gray-600 mb-8">What can I help you with today?</p>
        <HomePageInput />
        <SponsoredQuestions />
      </div>
      <div className="h-10 flex justify-center items-center">
        <Dialog>
          <DialogTrigger className="mb-12">
            <div className="w-full h-full rounded-lg text-gray-400 hover:text-black hover:border hover:border-black cursor-pointer text-xs p-2 font-light">
              Advertiser? Open the portal.
              <ExternalLink className="inline ml-2" size={12} />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <div className="grid grid-cols-2 gap-4 pt-4">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/analytics/${company.id}`}
                  className="flex h-24 items-center justify-center rounded-lg border border-transparent p-4 shadow-md transition-all hover:border-black"
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-full w-full object-contain"
                  />
                </Link>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Page;
