import Image from "next/image";

export default function CompanySection() {
  return (
    <div className="bg-zinc-100 py-4">
      <p className="py-4 text-center text-lg font-medium opacity-40">
        Trusted by the world’s best companies
      </p>
      <div className="container flex flex-wrap items-center justify-between">
        <Image
          src="/images/client_interface/air-company-logo.png"
          width={128}
          height={128}
          alt=""
          className="opacity-40"
        />
        <Image
          src="/images/client_interface/nike.png"
          width={128}
          height={128}
          alt=""
          className="opacity-40"
        />
        <Image
          src="/images/client_interface/samsung.png"
          width={128}
          height={128}
          alt=""
          className="opacity-40"
        />
        <Image
          src="/images/client_interface/amazon-pay.png"
          width={128}
          height={128}
          alt=""
          className="opacity-40"
        />
      </div>
    </div>
  );
}
