"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import Loader from "../../../Components/Loader";
import { fetchAllDeaneries, fetchAllParish } from "../../../Redux/Api";
import { safeFetchList } from "../../../helpers/api";

function ViewParishes() {
  const [parish, setParishes] = useState([]);
  const [deaneries, setDeaneries] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingParishes, setLoadingParishes] = useState(false);
  const [loadingDeaneries, setLoadingDeaneries] = useState(false);
  const [parishError, setParishError] = useState(null);
  const [deaneryError, setDeaneryError] = useState(null);

  const fetchParishes = async () => {
    setLoadingParishes(true);
    const { items, error } = await safeFetchList(fetchAllParish);
    setParishes(items);
    setParishError(error);
    if (error) console.error("Error fetching parishes:", error);
    setLoadingParishes(false);
  };

  const fetchDeanery = async () => {
    setLoadingDeaneries(true);
    const { items, error } = await safeFetchList(fetchAllDeaneries);
    setDeaneries(items);
    setDeaneryError(error);
    if (error) console.error("Error fetching deaneries:", error);
    setLoadingDeaneries(false);
  };

  useEffect(() => {
    fetchParishes();
  }, []);

  useEffect(() => {
    fetchDeanery();
  }, []);

  const getDeaneryName = (id) => {
    const deanName = deaneries.filter((item) => item.id.includes(id));
    return deanName[0]?.name;
  };

  const isLoading = loadingParishes || loadingDeaneries;

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] bg-white">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"View Parishes"}
        />
      </div>
      <div>
        {(parishError || deaneryError) && (
          <p className="mt-6 text-center text-red-600">
            {parishError && (
              <span>
                {parishError}{" "}
                <button type="button" onClick={fetchParishes} className="underline">
                  Retry parishes
                </button>
              </span>
            )}{" "}
            {deaneryError && (
              <span>
                {deaneryError}{" "}
                <button type="button" onClick={fetchDeanery} className="underline">
                  Retry deaneries
                </button>
              </span>
            )}
          </p>
        )}

        {isLoading && parish.length === 0 ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : parish.length === 0 ? (
          <p className="mt-6 text-center">No parishes available.</p>
        ) : (
          <table className="table-fixed border w-[80%] mx-auto mt-[2.5rem]">
            <thead>
              <tr className="border-b">
                <th className=" py-[.5rem]">Name</th>
                <th className=" py-[.5rem]">Deanery</th>
                <th className=" py-[.5rem]">HasPaid</th>
              </tr>
            </thead>
            <tbody>
              {parish.map((item) => (
                <tr className="text-center" key={item?.id}>
                  <td className="text-center border py-[.5rem]">
                    {item?.name}
                  </td>
                  <td className="text-center border py-[.5rem]">
                    {getDeaneryName(item?.deaneryId)}
                  </td>
                  <td className="text-center border py-[.5rem]">
                    {item?.hasPaid === false ? "No" : "Yes"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ViewParishes;
