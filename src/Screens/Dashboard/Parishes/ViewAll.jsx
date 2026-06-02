"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExportButton from "../../../Components/Common/ExportButton";
import Pagination from "../../../Components/Common/Pagination";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import Loader from "../../../Components/Loader";
import { deleteParish, fetchAllParish } from "../../../Redux/Api";
import { apiErrorMessage, safeFetchPaginated } from "@/src/helpers/api";

function ViewParishes() {
  const [parish, setParishes] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingParishes, setLoadingParishes] = useState(false);
  const [parishError, setParishError] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [feedback, setFeedback] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchParishes = async (page = 1, search = "", limit = pageSize) => {
    setLoadingParishes(true);
    setParishError(null);
    const { items, pages, total, page: resPage, error } =
      await safeFetchPaginated(fetchAllParish, { page, limit, search });
    if (error) {
      setParishError(error);
      setParishes([]);
      setTotalPages(1);
      setTotalItems(0);
    } else {
      setParishes(items);
      setTotalPages(pages);
      setTotalItems(total);
      setCurrentPage(resPage || page);
    }
    setLoadingParishes(false);
  };

  useEffect(() => {
    fetchParishes(1, "", pageSize);
    // eslint-disable-next-line
  }, []);

  // Deanery name comes straight from the included payload (item.Deanery).
  const newParishes = useMemo(
    () =>
      parish.map((item) => ({
        ...item,
        deaneryName: item.Deanery?.name || "-",
      })),
    [parish]
  );

  const onInputChange = (search) => {
    setSearchTerm(search);
    fetchParishes(1, search, pageSize);
  };

  const handlePageChange = (page) => fetchParishes(page, searchTerm, pageSize);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    fetchParishes(1, searchTerm, size);
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
      setParishes((prev) =>
        prev.filter((parishItem) => parishItem.id !== item.id)
      );
      setTotalItems((prev) => Math.max(0, prev - 1));
      setFeedback({
        type: "success",
        message: `${item.name} deleted successfully.`,
      });
    } catch (error) {
      const message = apiErrorMessage(error, "Could not delete parish.");
      setFeedback({ type: "error", message });
      console.error("Error deleting parish:", error.response || error);
    } finally {
      setDeletingId("");
    }
  };

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

        {parishError && (
          <div className="w-[80%] mx-auto mt-4 text-center text-sm text-red-600">
            {parishError}{" "}
            <button
              type="button"
              onClick={() => fetchParishes(currentPage, searchTerm, pageSize)}
              className="underline"
            >
              Retry parishes
            </button>
          </div>
        )}

        <div className="flex my-4 rounded-[5px] bg-primary mx-auto items-center w-[80%] md:w-[400px]">
          <input
            placeholder="Search Parish name "
            value={searchTerm}
            onChange={(e) => onInputChange(e.target.value)}
            className="py-[.5rem] rounded-tl-[5px] rounded-bl-[5px] w-[80%] px-[1rem] outline-none border-none "
          />
          <p className="px-[.5rem] text-white">Search</p>
        </div>

        {loadingParishes && newParishes.length === 0 ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : newParishes.length === 0 ? (
          <p className="text-center my-[3rem] text-primary">
            {searchTerm
              ? "No parishes match your search."
              : "No parishes available."}
          </p>
        ) : (
          <>
            <div className="w-[96%] mx-auto overflow-x-auto">
              <table className="w-full min-w-[560px] border mb-[1rem]">
                <thead>
                  <tr className="border-b text-xs sm:text-sm md:text-base">
                    <th className="py-[.5rem] w-[60px]">S/N</th>
                    <th className="py-[.5rem]">Name</th>
                    <th className="py-[.5rem]">Deanery</th>
                    <th className="py-[.5rem] w-[70px]">Paid</th>
                    <th className="py-[.5rem] w-[150px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {newParishes.map((item, index) => (
                    <tr
                      className="text-center text-xs sm:text-sm md:text-base"
                      key={item?.id || index}
                    >
                      <td className="border py-[.5rem]">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="border py-[.5rem] px-2">{item?.name}</td>
                      <td className="border py-[.5rem] px-2">
                        {item?.deaneryName}
                      </td>
                      <td className="border py-[.5rem]">
                        {item?.hasPaid === true ? "Yes" : "No"}
                      </td>
                      <td className="border py-[.5rem] whitespace-nowrap">
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
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              disabled={loadingParishes}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ViewParishes;
