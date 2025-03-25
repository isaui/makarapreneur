import Image from "next/image";
import map from "@/assets/dummyMap.png";
import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="relative overflow-hidden">
            <div className="w-full bg-linen text-signalBlack bottom-0 pt-8 flex flex-col">
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(100,149,237,0.08),transparent_50%)]" />

                <div className="flex justify-between w-full mt-5 px-6 lg:px-12 flex-wrap gap-y-8 mb-8 relative z-10">
                    {/* About Section */}
                    <div className="w-full md:w-auto max-w-sm group">
                        <h3 className="text-cornflowerBlue font-semibold text-lg mb-4 relative">
                            About Us
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cornflowerBlue transition-all duration-300 group-hover:w-20" />
                        </h3>
                        <p className="max-w-[292px] font-medium text-signalBlack/80 leading-relaxed transition-all duration-300 group-hover:text-signalBlack">
                            Makarapreneur is an entrepreneurial ecosystem under
                            HIPMI PT UI that nurtures innovation, business
                            acumen, and networking among students. Through
                            various programs, competitions, and collaborations,
                            it provides a platform for aspiring entrepreneurs to
                            develop their skills, gain industry insights, and
                            connect with like-minded individuals.
                        </p>
                    </div>

                    {/* Navigation Section */}
                    <div className="w-full md:w-auto">
                        <h3 className="text-cornflowerBlue font-semibold text-lg mb-4 relative group">
                            Navigation
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cornflowerBlue transition-all duration-300 group-hover:w-24" />
                        </h3>
                        <ul className="font-medium flex flex-col gap-2">
                            {[
                                { name: "Home", href: "/" },
                                { name: "About", href: "/aboutus" },
                                { name: "Competition", href: "/competition" },
                                { name: "Event", href: "/event" },
                                { name: "Makara Inspires", href: "/makarainspires" },
                                { name: "Contact", href: "/contact" }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="w-fit group/link"
                                >
                                    <li className="relative text-signalBlack/80 hover:text-signalBlack transition-colors duration-300">
                                        {item.name}
                                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-cornflowerBlue transition-all duration-300 group-hover/link:w-full" />
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    </div>

                    {/* Location Section */}
                    <div className="w-full md:w-auto">
                        <h3 className="text-cornflowerBlue font-semibold text-lg mb-4 relative group">
                            Location
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cornflowerBlue transition-all duration-300 group-hover:w-20" />
                        </h3>
                        <div className="relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
                            <Image
                                src={map}
                                alt="map"
                                width={300}
                                height={200}
                                className="transition-transform duration-500 hover:scale-105"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="flex flex-col md:flex-row justify-between py-4 border-t border-signalBlack/10 px-6 lg:px-12 font-medium items-center gap-4 relative z-10">
                    <h3 className="text-sm text-signalBlack/70 text-center md:text-left">
                        Makarapreneur 2025
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-signalBlack/70">
                            Follow us:
                        </span>
                        <div className="flex gap-4">
                    <Link
                        href="https://www.instagram.com/makarapreneur"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:-translate-y-1 hover:opacity-80"
                    >
                        <FaInstagram
                            className="w-5 h-5"
                            style={{ color: "#E4405F" }}
                        />
                    </Link>
                    <Link
                        href="https://x.com/makarapreneur"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:-translate-y-1 hover:opacity-80"
                    >
                        <FaTwitter
                            className="w-5 h-5"
                            style={{ color: "#1DA1F2" }}
                        />
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/makarapreneur-hipmi-pt-ui-71a9262b9/?originalSubdomain=id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:-translate-y-1 hover:opacity-80"
                    >
                        <FaLinkedinIn
                            className="w-5 h-5"
                            style={{ color: "#0A66C2" }}
                        />
                    </Link>
                                        
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
