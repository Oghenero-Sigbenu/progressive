"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportButton from "../../../Components/Common/ExportButton";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import Loader from "../../../Components/Loader";
import {
  fetchAllAyds,
  fetchAllDeaneries,
  fetchAllParish,
  getAllAydDelegates,
} from "../../../Redux/Api";
import { safeFetchList } from "../../../helpers/api";

function ViewAYD() {
  const [parish, setParishes] = useState([]);
  const [ayd, setAyd] = useState([]);
  const [selectedAyd, setSelectedAyd] = useState("");

  const [deaneries, setDeaneries] = useState([]);
  const [newDelegates, setNewDelegates] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [aydLoading, setAydLoading] = useState(false);
  const [delegatesLoading, setDelegatesLoading] = useState(false);

  const [aydError, setAydError] = useState(null);
  const [deaneryError, setDeaneryError] = useState(null);
  const [parishError, setParishError] = useState(null);
  const [delegateError, setDelegateError] = useState(null);

  const fetchAyd = async () => {
    setAydLoading(true);
    setAydError(null);
    const { items, error } = await safeFetchList(fetchAllAyds);
    setAyd(items);
    setAydError(error);
    setAydLoading(false);
  };

  const fetchDeanery = async () => {
    setDeaneryError(null);
    const { items, error } = await safeFetchList(fetchAllDeaneries);
    setDeaneries(items);
    setDeaneryError(error);
  };

  const fetchParishes = async () => {
    setParishError(null);
    const { items, error } = await safeFetchList(fetchAllParish);
    setParishes(items);
    setParishError(error);
  };

  const fetchDelegates = async () => {
    if (!selectedAyd) {
      setNewDelegates([]);
      return;
    }
    setDelegatesLoading(true);
    setDelegateError(null);
    const { items, error } = await safeFetchList(getAllAydDelegates, selectedAyd);
    setNewDelegates(items);
    setDelegateError(error);
    setDelegatesLoading(false);
  };

  useEffect(() => {
    fetchParishes();
    fetchAyd();
    fetchDeanery();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchDelegates();
    // eslint-disable-next-line
  }, [selectedAyd]);

  const deaneryNameById = useMemo(
    () => Object.fromEntries(deaneries.map((d) => [d.id, d.name])),
    [deaneries]
  );
  const parishNameById = useMemo(
    () => Object.fromEntries(parish.map((p) => [p.id, p.name])),
    [parish]
  );

  const decoratedDelegates = useMemo(() => {
    const rows = newDelegates.map((item) => ({
      ...item,
      deaneryName: deaneryNameById[item.deaneryId] || item.deaneryId,
      parishName: parishNameById[item.parishId] || item.parishId,
      shortId: item?.id ? String(item.id).slice(0, 5) : "",
    }));
    return rows.sort((a, b) =>
      (a.deaneryName || "").localeCompare(b.deaneryName || "")
    );
  }, [newDelegates, deaneryNameById, parishNameById]);

  const handleChange = (event) => setSelectedAyd(event.target.value);

  const selectedItem = ayd.find((item) => item?.id === selectedAyd);

  const aydDropdownDisabled =
    aydLoading || !!aydError || ayd.length === 0;

  const aydPlaceholder = aydLoading
    ? "Loading AYD events…"
    : aydError
    ? "Unable to load AYD events"
    : ayd.length === 0
    ? "No AYD events yet"
    : "Select year";

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] bg-white">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"View Delegates"}
        />
      </div>

      <div className="flex flex-col items-end gap-1 w-[80%] mx-auto mt-[1rem]">
        <select
          onChange={handleChange}
          value={selectedAyd}
          disabled={aydDropdownDisabled}
          className="bg-primary text-white border-none hover:bg-primary px-[2rem] py-[.5rem] rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">{aydPlaceholder}</option>
          {ayd.map((item) => (
            <option key={item.id} value={item.id}>
              {new Date(item?.createdAt || item?.startDate)?.getFullYear() ||
                item?.theme}
            </option>
          ))}
        </select>
        {aydError && (
          <button
            type="button"
            onClick={fetchAyd}
            className="text-xs text-red-600 underline"
            disabled={aydLoading}
          >
            Retry loading AYD events
          </button>
        )}
      </div>

      {(deaneryError || parishError) && (
        <div className="w-[80%] mx-auto mt-2 text-xs text-amber-700">
          {deaneryError && (
            <span>
              Deanery names unavailable ({deaneryError}){" "}
              <button
                type="button"
                onClick={fetchDeanery}
                className="underline"
              >
                retry
              </button>
              .
            </span>
          )}{" "}
          {parishError && (
            <span>
              Parish names unavailable ({parishError}){" "}
              <button
                type="button"
                onClick={fetchParishes}
                className="underline"
              >
                retry
              </button>
              .
            </span>
          )}
        </div>
      )}

      <div className="flex justify-end w-[80%] mx-auto mt-[1rem]">
        <ExportButton
          data={decoratedDelegates}
          fileName={"AYD Registered Delegates"}
        />
      </div>

      {selectedItem && (
        <div className="w-[80%] mx-auto mt-[1rem]">
          <div className="flex gap-[8px]">
            <h4 className="font-[700]">Theme:</h4>
            <span>{selectedItem?.theme}</span>
          </div>
          <div className="flex gap-[8px]">
            <h4 className="font-[700]">Venue:</h4>
            <span>{selectedItem?.venue}</span>
          </div>
          <div className="flex gap-[8px]">
            <h4 className="font-[700]">Registered Delegates:</h4>
            <span>{selectedItem?.totalDelegates}</span>
          </div>
          <div className="flex gap-[8px]">
            <h4 className="font-[700]">Registered Parish:</h4>
            <span>{selectedItem?.totalPaidParish}</span>
          </div>
        </div>
      )}

      <div>
        {delegatesLoading ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : delegateError ? (
          <div className="text-center my-[2rem]">
            <p className="text-red-600">{delegateError}</p>
            <button
              type="button"
              onClick={fetchDelegates}
              className="underline text-primary"
            >
              Retry
            </button>
          </div>
        ) : !selectedAyd ? (
          <h4 className="text-center my-[2rem] text-[700]">
            Select an AYD year to view delegates.
          </h4>
        ) : decoratedDelegates.length === 0 ? (
          <h4 className="text-center my-[2rem] text-[700]">
            No delegate registered.
          </h4>
        ) : (
          <table className="table-fixed border w-[80%] mx-auto mt-[2.5rem] mb-[3rem]">
            <thead>
              <tr className="border-b">
                <th className="text-[.6rem] md:text-[1rem] py-[.5rem] w-[40px]">S/N</th>
                <th className="text-[.6rem] md:text-[1rem] py-[.5rem]">First Name</th>
                <th className="text-[.6rem] md:text-[1rem] py-[.5rem]">Last Name</th>
                <th className="text-[.6rem] md:text-[1rem] py-[.5rem]">Email</th>
                <th className="text-[.6rem] md:text-[1rem] py-[.5rem]">Parish</th>
                <th className="text-[.6rem] md:text-[1rem] py-[.5rem]">Deanery</th>
              </tr>
            </thead>
            <tbody>
              {decoratedDelegates.map((item, index) => (
                <tr
                  className="text-center text-[.6rem] md:text-[1rem]"
                  key={item.id || index}
                >
                  <td className="text-center border py-[.5rem] w-[40px]">
                    {index + 1}
                  </td>
                  <td className="text-center border py-[.5rem]">{item?.firstName}</td>
                  <td className="text-center border py-[.5rem]">{item?.lastName}</td>
                  <td className="text-center border py-[.5rem]">{item?.email}</td>
                  <td className="text-center border py-[.5rem]">{item?.parishName}</td>
                  <td className="text-center text-[.6rem] md:text-[1rem] border py-[.5rem]">
                    {item?.deaneryName}
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

export default ViewAYD;
