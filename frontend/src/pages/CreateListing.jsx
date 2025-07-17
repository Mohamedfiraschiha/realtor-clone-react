import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FcHome } from "react-icons/fc";
import Spinner from "../Components/Spinner";

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: [],
  });

  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") boolean = true;
    if (e.target.value === "false") boolean = false;
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, images: e.target.files }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  async function uploadImages(files) {
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const form = new FormData();
      form.append("file", files[i]);
      form.append("upload_preset", "react-uploads");
      const res = await fetch("https://api.cloudinary.com/v1_1/dj0xaaqox/image/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Image upload failed");
      uploadedUrls.push(data.secure_url);
    }
    return uploadedUrls;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error("Discounted price must be less than regular price");
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images allowed");
      return;
    }
    try {
      const imgUrls = await uploadImages(images);
      const listing = {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        description,
        offer,
        regularPrice,
        discountedPrice: offer ? discountedPrice : null,
        images: imgUrls,
      };
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(listing),
      });
      if (!res.ok) throw new Error("Failed to create listing");
      const data = await res.json();
      toast.success("Listing created");
      navigate("/profile");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner />;

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
    images,
  } = formData;

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Create a Listing</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
        <div className="flex">
          <button type="button" id="type" value="sale" onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${type === "rent" ? "bg-white text-black" : "bg-slate-600 text-white"}`}>sell</button>
          <button type="button" id="type" value="rent" onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${type === "sale" ? "bg-white text-black" : "bg-slate-600 text-white"}`}>rent</button>
        </div>
        <p className="text-lg mt-6 font-semibold">Name</p>
        <input type="text" id="name" value={name} onChange={onChange} placeholder="Name" maxLength="32" minLength="10" required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6" />
        <div className="flex space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold">Beds</p>
            <input type="number" id="bedrooms" value={bedrooms} onChange={onChange} min="1" max="50" required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center" />
          </div>
          <div>
            <p className="text-lg font-semibold">Baths</p>
            <input type="number" id="bathrooms" value={bathrooms} onChange={onChange} min="1" max="50" required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center" />
          </div>
        </div>
        <p className="text-lg mt-6 font-semibold">Parking spot</p>
        <div className="flex">
          <button type="button" id="parking" value={true} onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${!parking ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Yes</button>
          <button type="button" id="parking" value={false} onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${parking ? "bg-white text-black" : "bg-slate-600 text-white"}`}>No</button>
        </div>
        <p className="text-lg mt-6 font-semibold">Furnished</p>
        <div className="flex">
          <button type="button" id="furnished" value={true} onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${!furnished ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Yes</button>
          <button type="button" id="furnished" value={false} onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${furnished ? "bg-white text-black" : "bg-slate-600 text-white"}`}>No</button>
        </div>
        <p className="text-lg mt-6 font-semibold">Address</p>
        <textarea type="text" id="address" value={address} onChange={onChange} placeholder="Address" required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6" />
        <p className="text-lg font-semibold">Description</p>
        <textarea type="text" id="description" value={description} onChange={onChange} placeholder="Description" required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6" />
        <p className="text-lg font-semibold">Offer</p>
        <div className="flex mb-6">
          <button type="button" id="offer" value={true} onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${!offer ? "bg-white text-black" : "bg-slate-600 text-white"}`}>Yes</button>
          <button type="button" id="offer" value={false} onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${offer ? "bg-white text-black" : "bg-slate-600 text-white"}`}>No</button>
        </div>
        <div className="flex items-center mb-6">
          <div className="">
            <p className="text-lg font-semibold">Regular price</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input type="number" id="regularPrice" value={regularPrice} onChange={onChange} min="50" max="400000000" required className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center" />
              {type === "rent" && (
                <div className="">
                  <p className="text-md w-full whitespace-nowrap">$ / Month</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {offer && (
          <div className="flex items-center mb-6">
            <div className="">
              <p className="text-lg font-semibold">Discounted price</p>
              <div className="flex w-full justify-center items-center space-x-6">
                <input type="number" id="discountedPrice" value={discountedPrice} onChange={onChange} min="50" max="400000000" required={offer} className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center" />
                {type === "rent" && (
                  <div className="">
                    <p className="text-md w-full whitespace-nowrap">$ / Month</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="mb-6">
          <p className="text-lg font-semibold">Images</p>
          <p className="text-gray-600">The first image will be the cover (max 6)</p>
          <input type="file" id="images" onChange={onChange} accept=".jpg,.png,.jpeg" multiple required className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600" />
        </div>
        <button type="submit" className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">Create Listing</button>
      </form>
    </main>
  );
  
}
