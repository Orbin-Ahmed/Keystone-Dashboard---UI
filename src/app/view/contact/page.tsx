"use client";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { Spinner } from "@radix-ui/themes";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Request submitted successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        console.log(formData);
        setMessage("Failed to submit your request. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-center text-4xl font-bold">Contact Us</h1>

      <div className="mb-8 text-center">
        <p className="mb-2 text-lg">
          <strong>Phone:</strong> +971503122300
        </p>
        <p className="mb-2 text-lg">
          <strong>Email:</strong> sales@keystoneuae.com
        </p>
        <p className="mb-2 text-lg">
          <strong>Address:</strong> Abu Dhabi, UAE
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <InputField
          id="name"
          name="name"
          onChange={handleChange}
          type="text"
          placeholder="Name"
          className="px-4.5 py-3"
        />
        <InputField
          id="email"
          name="email"
          onChange={handleChange}
          type="email"
          placeholder="Email"
          className="px-4.5 py-3"
        />
        <InputField
          id="phone"
          name="phone"
          onChange={handleChange}
          type="text"
          placeholder="Phone"
          className="px-4.5 py-3"
        />
        <textarea
          id="message"
          name="message"
          onChange={handleChange}
          placeholder="Message"
          rows={4}
          className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
        />
        <CustomButton type="submit" disabled={loading}>
          <div className="flex items-center justify-center">
            <span className="mr-2">Save</span>
            <Spinner loading={loading}></Spinner>
          </div>
        </CustomButton>
      </form>

      {message && <p className="mt-4 text-center text-lg">{message}</p>}
    </div>
  );
}
