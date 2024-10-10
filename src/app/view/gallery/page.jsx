import Image from "next/image";

export default function Gallery() {
  return (
    <div className="container grid grid-cols-2 gap-4 py-10 md:grid-cols-4">
      <div className="flex flex-col gap-4">
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/(1).jpg"
            alt="Image 1"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/(2).jpg"
            alt="Image 2"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/(3).jpg"
            alt="Image 3"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/g (5).jpg"
            alt="Image 4"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/g (6).jpg"
            alt="Image 5"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/(4).jpg"
            alt="Image 6"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/(5).jpg"
            alt="Image 7"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/(6).jpg"
            alt="Image 8"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/g (7).jpg"
            alt="Image 9"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/(7).jpg"
            alt="Image 10"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/(8).jpg"
            alt="Image 11"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/g (1).jpg"
            alt="Image 12"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/g (2).jpg"
            alt="Image 13"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/g (3).jpg"
            alt="Image 14"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
        <div>
          <Image
            className="rounded-lg"
            src="/images/view/resized/g (4).jpg"
            alt="Image 15"
            width={400}
            height={300}
            layout="responsive"
            objectFit="cover"
          />
        </div>
      </div>
    </div>
  );
}
