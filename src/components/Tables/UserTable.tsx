import { USER } from "@/types/user";
import { AlertDialog, Dialog } from "@radix-ui/themes";
import Image from "next/image";
import Alert from "../ui/Alert";
import CustomButton from "../CustomButton";
import CustomDialog from "../ui/CustomDialog";

const userData: USER[] = [
  {
    image: "https://avatar.iran.liara.run/public/boy",
    username: "Orbin23",
    email: "acantoahmed67@gmail.com",
    status: "active",
    role: "Server Admin",
  },
  {
    image: "https://avatar.iran.liara.run/public/boy",
    username: "Amir",
    email: "amir@gmail.com",
    status: "active",
    role: "Moderator",
  },
  {
    image: "https://avatar.iran.liara.run/public/boy",
    username: "Isacc",
    email: "isacc@gmail.com",
    status: "active",
    role: "Designer",
  },
];

const UserTable = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        User
      </h4>

      <div className="flex flex-col">
        {/* Header  */}
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Username
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Email
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Status
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Role
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Action
            </h5>
          </div>
        </div>
        {/* Header end */}

        {/* User Data  */}
        {userData.map((user, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === userData.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="flex-shrink-0">
                <Image src={user.image} alt="Brand" width={48} height={48} />
              </div>
              <p className="hidden text-black dark:text-white sm:block">
                {user.username}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{user.email}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3">{user.status}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{user.role}</p>
            </div>

            {/* Button area  */}
            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <Dialog.Root>
                <Dialog.Trigger>
                  <CustomButton className="mr-2">View</CustomButton>
                </Dialog.Trigger>
                <CustomDialog
                  title="User"
                  description="The following user have access to this system."
                  name={user.username}
                  email={user.email}
                  role={user.role}
                  isDisabled={false}
                />
              </Dialog.Root>

              <AlertDialog.Root>
                <AlertDialog.Trigger>
                  <CustomButton className="bg-danger">Disable</CustomButton>
                </AlertDialog.Trigger>
                <Alert
                  title="Revoke access"
                  description="Are you sure you want to remove this user? Their access to this system
                                will be temporarily revoked."
                />
              </AlertDialog.Root>
            </div>
            {/* Button area  end */}
          </div>
        ))}
        {/* User Data end */}
      </div>
    </div>
  );
};

export default UserTable;
