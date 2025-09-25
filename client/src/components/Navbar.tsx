import profilePlaceholder from "../../public/images/profile-placeholder.png";

type NavbarProps = {
  username: string | null; // match the state type from Me.tsx
  name: string;
  surname: string;
};

const Navbar: React.FC<NavbarProps> = ({ username, surname, name }) => {
  return (
    <nav className="flex flex-col">
      <div className="flex flex-col items-center justify-center">
        <img src={profilePlaceholder} className="size-15 rounded-full" />
        <span className="flex flex-col items-center">
          <p>
            {name} {surname}
          </p>
          <p className="text-gray-400">@{username}</p>
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
