"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import {
  fetchAllDeaneries,
  fetchParishById,
  updateParish,
} from "../../../Redux/Api";
import Loader from "../../../Components/Loader";
import {
  safeFetchList,
  extractOne,
  apiErrorMessage,
} from "../../../helpers/api";

const EditParish = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [parishLoading, setParishLoading] = useState(false);
  const [deaneries, setDeaneries] = useState([]);
  const [loadingDeaneries, setLoadingDeaneries] = useState(false);
  const [deaneryError, setDeaneryError] = useState(null);
  const [parishDetails, setParishDetails] = useState({});
  const [parishLoadError, setParishLoadError] = useState(null);
  const [parishData, setParishData] = useState({
    name: "",
    email: "",
    hasPaid: 0,
    location: "",
    deaneryId: "",
  });

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    setParishData({
      name: parishDetails?.name,
      email: parishDetails?.email,
      hasPaid: parishDetails?.hasPaid,
      location: parishDetails?.location,
      deaneryId: parishDetails?.deaneryId,
    });
  }, [parishDetails]);

  const handleChange = (e) => {
    e.preventDefault();
    setParishData({
      ...parishData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (event) => {
    setParishData({ ...parishData, deaneryId: event.target.value });
  };

  const handleEditParish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateParish({ parishId: id, parishData });
      if (data) {
        setLoading(false);
        setShow(true);
      }
    } catch (err) {
      if (err.response?.data?.msg) {
        setLoading(false);
        alert(err.response?.data?.msg);
        console.error("Error fetching data:", err.response);
      }
    }
  };

  const fetchAllDeanery = async () => {
    setLoadingDeaneries(true);
    setDeaneryError(null);
    const { items, error } = await safeFetchList(fetchAllDeaneries);
    setDeaneries(items);
    setDeaneryError(error);
    setLoadingDeaneries(false);
  };

  const getParishById = async () => {
    setParishLoading(true);
    setParishLoadError(null);
    try {
      const res = await fetchParishById(id);
      const parish = extractOne(res);
      if (parish) setParishDetails(parish);
      else setParishLoadError("Parish not found");
    } catch (error) {
      setParishLoadError(apiErrorMessage(error, "Could not load parish"));
    } finally {
      setParishLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDeanery();
  }, []);

  useEffect(() => {
    if (id) getParishById();
    // eslint-disable-next-line
  }, [id]);

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] bg-white">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"Edit Parish"}
          path={"/dashboard/parishes"}
        />
      </div>

      <div>
        {parishLoadError ? (
          <p className="mt-6 text-center text-red-600">
            {parishLoadError}{" "}
            <button type="button" onClick={getParishById} className="underline">
              Retry
            </button>
          </p>
        ) : parishLoading || !parishDetails || Object.keys(parishDetails).length === 0 ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : (
          <form
            className="w-[97%] my-[2rem] px-[1rem] mx-auto"
            onSubmit={handleEditParish}
          >
            <div className="flex flex-wrap justify-between">
              <div className="mt-[18px] w-full md:w-[49%]">
                <label className="mb-[15px] text-[.8rem]">Name </label>
                <div className="w-full flex rounded-[10px] shadow-sm  mt-[.5rem] h-[54px] justify-between items-center ">
                  <input
                    name="name"
                    className="w-full border-none rounded-[10px] outline-none h-full px-[22px]"
                    value={parishData.name || ""}
                    placeholder="St. John Catholic Church, Ado"
                    onChange={(e) => handleChange(e)}
                  />
                </div>
              </div>

              <div className="mt-[18px] w-full md:w-[49%]">
                <label className="mb-[15px] text-[.8rem]">Deanery </label>
                <div className="w-full flex rounded-[10px] shadow-sm  mt-[.5rem] h-[54px] justify-between items-center ">
                  <select
                    name="deaneryId"
                    className="w-full border-none rounded-[10px] outline-none h-full px-[22px] disabled:opacity-60"
                    value={parishData.deaneryId || ""}
                    onChange={handleSelectChange}
                    disabled={
                      loadingDeaneries || !!deaneryError || deaneries.length === 0
                    }
                  >
                    <option value="">
                      {loadingDeaneries
                        ? "Loading deaneries…"
                        : deaneryError
                        ? "Unable to load deaneries"
                        : deaneries.length === 0
                        ? "No deaneries available"
                        : "Select Deanery"}
                    </option>
                    {deaneries.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item?.name}
                      </option>
                    ))}
                  </select>
                </div>
                {deaneryError && (
                  <p className="mt-1 text-xs text-red-600">
                    {deaneryError}{" "}
                    <button
                      type="button"
                      onClick={fetchAllDeanery}
                      className="underline"
                      disabled={loadingDeaneries}
                    >
                      Retry
                    </button>
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-between">
              <div className="mt-[18px] w-full md:w-[49%]">
                <label className="mb-[15px] text-[.8rem]">AYD Payment </label>
                <div className="w-full flex rounded-[10px] shadow-sm  mt-[.5rem] h-[54px] justify-between items-center ">
                  <select
                    name="hasPaid"
                    className="w-full border-none rounded-[10px] outline-none h-full px-[22px]"
                    value={parishData.hasPaid ? "Yes" : "No"}
                    onChange={(e) => handleChange(e)}
                  >
                    <option>AYD Payment</option>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
              </div>

              <div className="mt-[18px] w-full md:w-[49%]">
                <label className="mb-[15px] text-[.8rem]">Address </label>
                <div className="w-full flex rounded-[10px] shadow-sm  mt-[.5rem] h-[54px] justify-between items-center ">
                  <input
                    name="location"
                    className="w-full border-none rounded-[10px] outline-none h-full px-[22px]"
                    value={parishData.location || ""}
                    placeholder="Enter address"
                    onChange={(e) => handleChange(e)}
                  />
                </div>
              </div>
            </div>
            {show && (
              <h4 className="mt-[2rem] text-green text-center">
                Parish Successfully Updated!
              </h4>
            )}

            <div className="flex md:w-[400px] mx-auto justify-center items-center h-[48px] mt-[3rem] rounded-[5px] text-white bg-green">
              <button
                type="submit"
                className="border-none outline-none cursor-pointer"
              >
                {loading ? <Loader /> : "UPDATE"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditParish;
