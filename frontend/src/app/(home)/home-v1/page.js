import Explore from "@/components/common/Explore";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import About from "@/components/home/home-v1/About";
import ApartmentType from "@/components/home/home-v1/ApartmentType";
import CallToActions from "@/components/common/CallToActions";
import FeaturedListings from "@/components/home/home-v1/FeatuerdListings";
import Header from "@/components/home/home-v1/Header";
import Partner from "@/components/common/Partner";
import PopularListings from "@/components/home/home-v1/PopularListings";
import PropertiesByCities from "@/components/home/home-v1/PropertiesByCities";
import Testimonial from "@/components/home/home-v1/Testimonial";
import Hero from "@/components/home/home-v1/hero";
import Image from "next/image";
import Blog from "@/components/common/Blog";
import Link from "next/link";
import { getListings } from "@/services/listing/listings.server";

export const metadata = {
  title: "Bankers' Housing Construction",
};

async function fetchRecentListings() {
  try {
    const payload = await getListings({
      page: 1,
      limit: 6,
      sort: "createdAt",
      order: "desc",
    });
    const items = payload?.data?.items ?? payload?.items ?? payload?.data ?? [];

    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

const Home_V1 = async () => {
  const recentListings = await fetchRecentListings();

  return (
    <>
      {/* Main Header Nav */}
      <Header />
      {/* End Main Header Nav */}

      {/* Mobile Nav  */}
      <MobileMenu />
      {/* End Mobile Nav  */}

      {/* Home Banner Style V1 */}
      <section className="home-banner-style1 p0">
        <div className="home-style1">
          <div className="container">
            <div className="row">
              <div className="col-xl-11 mx-auto">
                <Hero />
              </div>
            </div>
          </div>
          {/* End .container */}

          <a href="#explore-property">
            <div className="mouse_scroll animate-up-4">
              <Image
                width={20}
                height={105}
                src="/images/about/home-scroll.png"
                alt="scroll image"
              />
            </div>
          </a>
        </div>
      </section>
      {/* End Home Banner Style V1 */}

      {/* About Area */}
      <section className="our-about pb90">
        <div className="container">
          <div className="row" data-aos="fade-up" data-aos-delay="100">
            <div className="col-lg-12 text-center text-lg-start">
              <h2>
                About us <br className="d-none d-lg-block" /> Transforming the
                Way You Live.
              </h2>
            </div>
          </div>

          {/* CEO Section (Image Left, Text Right) */}
          <div className="row mt80 align-items-center" data-aos="fade-up" data-aos-delay="200">
            <div className="col-lg-5 col-xl-5">
              <div className="about-img-box position-relative">
                <Image
                  width={518}
                  height={601}
                  className="w-100 h-100 cover bdrs12"
                  src="/images/owner-pic.png"
                  alt="Md. Aminur Rahman Mandal - CEO"
                />
              </div>
            </div>
            <div className="col-lg-7 col-xl-6 offset-xl-1 mt-4 mt-lg-0">
              <h4 className="mb-1">Md. Aminur Rahman Mandal</h4>
              <p className="text-thm fz15 mb25">Founder Chairman & Managing Director</p>
              
              <p className="text mb25">
                Aminur Rahman Mandal completed his BBA in 2007 and MBA in 2009 in Accounting from Islamic University, Kushtia.
                He began his professional career in the banking sector and served at several leading commercial banks in Bangladesh, 
                including United Commercial Bank, EXIM Bank, Social Islami Bank, First Security Islami Bank, and Dutch-Bangla Bank Limited. 
                He worked as a Management Trainee and Probationary Officer during the early stage of his career (2009–2011). 
                He later continued his career at Dutch-Bangla Bank Limited. In 2022, he resigned from Dutch-Bangla Bank Limited while serving as a Deputy Manager at a renowned branch.
              </p>
              <p className="text mb25">
                During his professional career, he founded Bankers Housing Society in 2018 with a clear vision to deliver secure, sustainable, and value-driven residential projects for bankers, their relatives, and their family friends.
                Under his leadership, the company has expanded its operational scope by incorporating associated ventures such as Bankers Housing Construction and Bankers Housing Development, and has also formed a platform where all can join to solve their accommodation problems in Dhaka city.
              </p>
              <p className="text mb25">
                With a forward-looking vision, Aminur Rahman Mandal is committed to establishing Bankers Housing Society, Bankers Housing Construction, and Bankers Housing Development as trusted and dependable names in the real estate sector, contributing to sustainable urban development and enhancing investor confidence for generations.
              </p>
              
              <h5 className="mb-3">Our motto is "We Build Trust"</h5>
              <ul className="mb0 ps-3 about-values-list text mb40">
                <li><strong>Excellence:</strong> Every project is crafted with world-class quality and attention to detail.</li>
                <li><strong>Trust & Transparency:</strong> We believe in honesty and building long-term relationships.</li>
                <li><strong>Innovation:</strong> We combine creativity and technology to create future-ready solutions.</li>
              </ul>

              <div className="about-values-social d-flex align-items-center">
                <span className="fab fa-facebook-f about-social-icon me-3" aria-label="Facebook" />
                <span className="fab fa-twitter about-social-icon me-3" aria-label="Twitter" />
                <span className="fab fa-linkedin-in about-social-icon" aria-label="LinkedIn" />
              </div>
            </div>
          </div>

          {/* CFO Section (Text Left, Image Right Desktop | Image Top, Text Bottom Mobile) */}
          <div className="row mt80 align-items-center" data-aos="fade-up" data-aos-delay="300">
            <div className="col-lg-7 col-xl-6 order-2 order-lg-1 mt-4 mt-lg-0">
              <h4 className="mb-1">Abdullah Al Galib</h4>
              <p className="text-thm fz15 mb25">CFO – Bankers Housing Society</p>
              
              <p className="text mb25">
                Abdullah Al Galib completed his BBA in 2022 and MBA in 2023 in Banking and Insurance from University of Chittagong. 
                He is currently serving as the Chief Financial Officer (CFO) at Bankers Housing Society, where he manages financial planning and strategic growth initiatives.
              </p>

              <div className="p-4 bgc-f7 bdrs12 mb40 mt30">
                <h5 className="mb-2">Statement:</h5>
                <p className="text mb-0 fst-italic">
                  “We strive to be a trusted and secure housing solution and your reliable partner for a safe and trusted home.”
                </p>
              </div>

              <div className="about-values-social d-flex align-items-center">
                <span className="fab fa-facebook-f about-social-icon me-3" aria-label="Facebook" />
                <span className="fab fa-twitter about-social-icon me-3" aria-label="Twitter" />
                <span className="fab fa-linkedin-in about-social-icon" aria-label="LinkedIn" />
              </div>
            </div>
            
            <div className="col-lg-5 col-xl-5 offset-xl-1 order-1 order-lg-2">
              <div className="about-img-box position-relative">
                <Image
                  width={518}
                  height={601}
                  className="w-100 h-100 cover bdrs12"
                  src="/images/cfo.jpeg"
                  alt="Abdullah Al Galib - CFO"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bgc-f8">
        <div className="container">
          <div className="row align-items-center" data-aos="fade-up">
            <div className="col-lg-9">
              <div className="main-title2">
                <h2 className="title">Discover Our Featured Listings</h2>
                <p className="paragraph">
                  Aliquam lacinia diam quis lacus euismod
                </p>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="text-start text-lg-end mb-3">
                <Link className="ud-btn2" href="/map">
                  See All Properties
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          </div>
          {/* End header */}

          <div className="row">
            <div className="col-lg-12" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-listing-slider">
                <FeaturedListings listings={recentListings} />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="pb-20">
        <div className="how-we-help position-relative mx-auto bgc-thm-light maxw1600 pt120 pt60-md pb90 pb30-md bdrs12 mx20-lg">
          <div className="container">
            <div className="row">
              <div
                className="col-lg-6 m-auto wow fadeInUp"
                data-wow-delay="300ms"
              >
                <div className="main-title text-center">
                  <h2 className="title">Discover Properties</h2>
                  <p className="paragraph">
                    Find Properties In Your Favorite Cities
                  </p>
                </div>
              </div>
            </div>
            {/* End .row */}

            <div className="row">
              <Explore />
            </div>
          </div>
        </div>
      </section>

      {/* Our CTA */}
      <CallToActions />
      {/* Our CTA */}

      {/* Start Our Footer */}
      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
      {/* End Our Footer */}
    </>
  );
};

export default Home_V1;