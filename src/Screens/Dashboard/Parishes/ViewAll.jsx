"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportButton from "../../../Components/Common/ExportButton";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import Loader from "../../../Components/Loader";
import {
  deleteParish,
  fetchAllDeaneries,
  fetchAllParish,
} from "../../../Redux/Api";
import { apiErrorMessage, safeFetchList } from "@/src/helpers/api";

function ViewParishes() {
  const [parish, setParishes] = useState([]);
  const [deaneries, setDeaneries] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingParishes, setLoadingParishes] = useState(false);
  const [loadingDeaneries, setLoadingDeaneries] = useState(false);
  const [parishError, setParishError] = useState(null);
  const [deaneryError, setDeaneryError] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [feedback, setFeedback] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchParishes = async () => {
    setLoadingParishes(true);
    setParishError(null);
    const { items, error } = await safeFetchList(fetchAllParish);
    setParishes(items);
    setParishError(error);
    if (error) console.error("Error fetching parishes:", error);
    setLoadingParishes(false);
  };

  const fetchDeanery = async () => {
    setLoadingDeaneries(true);
    setDeaneryError(null);
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
    // eslint-disable-next-line
  }, []);

  const deaneryNameById = useMemo(() => {
    return deaneries.reduce((acc, item) => {
      if (item?.id) acc[item.id] = item?.name;
      return acc;
    }, {});
  }, [deaneries]);

  const newParishes = useMemo(() => {
    return [...parish]
      .map((item) => ({
        ...item,
        deaneryId: deaneryNameById[item?.deaneryId] || item?.deaneryId,
      }))
      .sort((a, b) => {
        if (a.deaneryId < b.deaneryId) return -1;
        if (a.deaneryId > b.deaneryId) return 1;
        return 0;
      });
  }, [deaneryNameById, parish]);


  const filteredItems = newParishes?.filter((item) =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const onInputChange = (search) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDeleteParish = async (item) => {
    if (!item?.id) return;

    const shouldDelete =
      typeof window === "undefined" ||
      window.confirm(`Delete "${item.name}"? This action cannot be undone.`);

    if (!shouldDelete) return;

    setFeedback(null);
    setDeletingId(item.id);

    try {
      await deleteParish(item.id);
      setParishes((prev) => prev.filter((parishItem) => parishItem.id !== item.id));
      setFeedback({
        type: "success",
        message: `${item.name} deleted successfully.`,
      });
    } catch (error) {
      const message = apiErrorMessage(error, "Could not delete parish.");
      setFeedback({
        type: "error",
        message,
      });
      console.error("Error deleting parish:", error.response || error);
    } finally {
      setDeletingId("");
    }
  };

  const isLoading = loadingParishes || loadingDeaneries;
  const hasLoadError = parishError || deaneryError;

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] bg-white">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"View Parishes"}
        />
      </div>
      <div className="flex justify-end w-[90%] mx-auto mt-[1rem]">
        <ExportButton data={newParishes} fileName={"AYD Registered Parishes"} />
      </div>
      <div className="w-full">
        {feedback && (
          <p
            className={`w-[80%] mx-auto mt-4 text-center ${
              feedback.type === "error" ? "text-red-600" : "text-green"
            }`}
          >
            {feedback.message}
          </p>
        )}

        {hasLoadError && (
          <div className="w-[80%] mx-auto mt-4 text-center text-sm text-red-600">
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
          </div>
        )}

        <div className="flex my-4 rounded-[5px] bg-primary mx-auto items-center w-[80%] md:w-[400px]">
          <input
            placeholder="Search Parish name "
            onChange={(e) => onInputChange(e.target.value)}
            className="py-[.5rem] rounded-tl-[5px] ounded-bl-[5px] w-[80%] px-[1rem] outline-none border-none "
          />
          <p className="px-[.5rem] text-white">Search</p>
        </div>

        {isLoading && newParishes.length === 0 ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center my-[3rem] text-primary">
            {searchTerm ? "No parishes match your search." : "No parishes available."}
          </p>
        ) : (
          <>
            <table className="table-fixed border w-[96%] mx-auto mb-[2.5rem] ">
              <thead>
                <tr className="border-b text-[10px] md:text-[14px]">
                  <th className=" py-[.5rem]  w-[30px] md:w-[90px]">S/N</th>
                  <th className=" py-[.5rem]  w-[120px] md:w-auto">Name</th>
                  <th className=" py-[.5rem] w-[50px]  md:w-[90px]">Deanery</th>
                  <th className=" py-[.5rem] w-[30px] md:w-[90px]">Paid</th>
                  <th className=" py-[.5rem] w-[120px] md:w-[180px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr className="text-center" key={item?.id || index}>
                    <td className="text-center text-[.6rem] md:text-[1rem] border py-[.5rem] w-[90px]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="text-center text-[.6rem] md:text-[1rem] border py-[.5rem]">
                      {item?.name}
                    </td>
                    <td className="text-center  text-[.5rem] md:text-[1rem] border py-[.5rem]">
                      {item?.deaneryId}
                    </td>
                    <td className="text-center text-[.6rem] md:text-[1rem] border py-[.5rem]">
                      {item?.hasPaid === true ? "Yes" : "No"}
                    </td>
                    <td className="text-center border text-[10px] md:text-[14px] py-[.5rem]">
                      <div className="flex justify-center items-center gap-3">
                        <a
                          href={`/dashboard/parishes/${item?.id}`}
                          className="text-[green] hover:cursor-pointer"
                        >
                          Edit
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteParish(item)}
                          disabled={deletingId === item?.id}
                          className="text-red-600 disabled:opacity-60"
                        >
                          {deletingId === item?.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mb-8">
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ViewParishes;
