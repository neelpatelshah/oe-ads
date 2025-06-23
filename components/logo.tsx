const Logo = ({ small }: { small?: boolean }) => {
  return (
    <div
      className={`${
        small ? "text-xl" : "text-4xl mb-4"
      } text-4xl text-black font-light`}
    >
      <span className="text-primary">m</span>
      ere<span className="text-primary">d</span>ith
    </div>
  );
};

export default Logo;
