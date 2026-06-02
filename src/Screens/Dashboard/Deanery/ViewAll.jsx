"use client";

import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../../../Components/Common/Pagination";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import Loader from "../../../Components/Loader";
import { fetchAllDeaneries } from "../../../Redux/Api";
import { safeFetchPaginated } from "@/src/helpers/api";

function ViewDeanries() {
  const [deaneries, setDeaneries] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchDeanery = async (page = 1, limit = pageSize) => {
    setLoading(true);
    setLoadError(null);
    const { items, pages, total, page: resPage, error } =
      await safeFetchPaginated(fetchAllDeaneries, { page, limit });
    if (error) {
      setLoadError(error);
      setDeaneries([]);
      setTotalPages(1);
      setTotalItems(0);
      console.error("Error fetching deaneries:", error);
    } else {
      setDeaneries(items);
      setTotalPages(pages);
      setTotalItems(total);
      setCurrentPage(resPage || page);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeanery(1, pageSize);
    // eslint-disable-next-line
  }, []);

  // Sort a copy in a memo — never mutate state during render.
  const sortedDeaneries = useMemo(
    () => [...deaneries].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [deaneries]
  );

  const handlePageChange = (page) => fetchDeanery(page, pageSize);
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    fetchDeanery(1, size);
  };

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
            <button
              type="button"
              onClick={() => fetchDeanery(currentPage, pageSize)}
              className="underline"
            >
              Retry
            </button>
          </p>
        )}

        {loading && sortedDeaneries.length === 0 ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : sortedDeaneries.length === 0 ? (
          <p className="mt-6 text-center">No deaneries available.</p>
        ) : (
          <>
            <div className="w-[80%] mx-auto mt-[2rem] overflow-x-auto">
              <table className="w-full min-w-[320px] border">
                <thead>
                  <tr className="border-b text-xs sm:text-sm md:text-base">
                    <th className="py-[.5rem] w-[90px]">S/N</th>
                    <th className="py-[.5rem]">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDeaneries.map((item, index) => (
                    <tr
                      className="text-center border-b text-xs sm:text-sm md:text-base"
                      key={item?.id || index}
                    >
                      <td className="border py-[.5rem]">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="text-center uppercase border py-[.5rem] px-2">
                        {item?.name}
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
              disabled={loading}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ViewDeanries;
