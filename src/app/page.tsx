// import Image from "next/image";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <>
      <div className=" bg-indigo-300/80 h-screen">
      <Dashboard />
      <Footer />
      </div>
    </>
  );
}
