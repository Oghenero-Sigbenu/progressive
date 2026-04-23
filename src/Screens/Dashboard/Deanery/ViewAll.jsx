"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import Loader from "../../../Components/Loader";
import { fetchAllDeaneries } from "../../../Redux/Api";
import { safeFetchList } from "@/src/helpers/api";

function ViewDeanries() {
  const [deaneries, setDeaneries] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchDeanery = async () => {
    setLoading(true);
    setLoadError(null);
    const { items, error } = await safeFetchList(fetchAllDeaneries);
    setDeaneries(items);
    setLoadError(error);
    if (error) console.error("Error fetching deaneries:", error);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeanery();
  }, []);

  deaneries.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] bg-white">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"View Deaneries"}
        />
      </div>
      <div>
        {loadError && (
          <p className="mt-6 text-center text-red-600">
            {loadError}{" "}
            <button type="button" onClick={fetchDeanery} className="underline">
              Retry
            </button>
          </p>
        )}

        {loading && deaneries.length === 0 ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : deaneries.length === 0 ? (
          <p className="mt-6 text-center">No deaneries available.</p>
        ) : (
          <table className="table-fixed border w-[80%] mx-auto mt-[2rem]">
            <thead>
              <tr className="border-b">
                <th className=" py-[.5rem] w-[90px]">S/N</th>
                <th className=" py-[.5rem]">Name</th>
                {/* <th className=" py-[.5rem]">Phone</th> */}
              </tr>
            </thead>
            <tbody>
              {deaneries.map((item, index) => (
                <tr className="text-center border-b" key={item?.id || index}>
                  <td>{index + 1}</td>
                  <td className="text-center uppercase border py-[.5rem]">
                    {item?.name}
                  </td>
                  {/* <td>{item?.phoneNumber}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ViewDeanries;
