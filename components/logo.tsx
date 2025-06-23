import { Crete_Round } from "next/font/google";

const logoFont = Crete_Round({
  weight: "400",
  subsets: ["latin"],
});

const Logo = ({ small }: { small?: boolean }) => {
  return (
    <div
      className={`${
        small ? "text-xl" : "text-4xl mb-4"
      } text-6xl text-black font-light ${logoFont.className}`}
    >
      <span className="text-primary">m</span>
      ere<span className="text-primary">d</span>ith
    </div>
  );
};

export default Logo;
