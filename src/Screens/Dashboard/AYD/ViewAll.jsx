"use client";

import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../../../Components/Common/Pagination";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import Loader from "../../../Components/Loader";
import { fetchAllAyds, getAllAydDelegates } from "../../../Redux/Api";
import { safeFetchList, safeFetchPaginated } from "../../../helpers/api";
import { exportToExcel } from "../../../helpers/utils";

const decorate = (rows) =>
  rows.map((item) => ({
    ...item,
    deaneryName: item.Deanery?.name || item.deaneryId || "-",
    parishName: item.Parish?.name || item.parishId || "-",
  }));

function ViewAYD() {
  const [ayd, setAyd] = useState([]);
  const [selectedAyd, setSelectedAyd] = useState("");
  const [delegates, setDelegates] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [aydLoading, setAydLoading] = useState(false);
  const [delegatesLoading, setDelegatesLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [aydError, setAydError] = useState(null);
  const [delegateError, setDelegateError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchAyd = async () => {
    setAydLoading(true);
    setAydError(null);
    const { items, error } = await safeFetchList(fetchAllAyds);
    setAyd(items);
    setAydError(error);
    setAydLoading(false);
  };

  const fetchDelegates = async (page = 1, limit = pageSize) => {
    if (!selectedAyd) {
      setDelegates([]);
      setTotalPages(1);
      setTotalItems(0);
      return;
    }
    setDelegatesLoading(true);
    setDelegateError(null);
    const { items, pages, total, page: resPage, error } =
      await safeFetchPaginated(getAllAydDelegates, selectedAyd, { page, limit });
    if (error) {
      setDelegateError(error);
      setDelegates([]);
      setTotalPages(1);
      setTotalItems(0);
    } else {
      setDelegates(items);
      setTotalPages(pages);
      setTotalItems(total);
      setCurrentPage(resPage || page);
    }
    setDelegatesLoading(false);
  };

  useEffect(() => {
    fetchAyd();
    // eslint-disable-next-line
  }, []);

  // Reload from page 1 whenever the selected AYD changes.
  useEffect(() => {
    setCurrentPage(1);
    fetchDelegates(1, pageSize);
    // eslint-disable-next-line
  }, [selectedAyd]);

  const decoratedDelegates = useMemo(() => decorate(delegates), [delegates]);

  const handlePageChange = (page) => fetchDelegates(page, pageSize);
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    fetchDelegates(1, size);
  };

  const handleChange = (event) => setSelectedAyd(event.target.value);
  const selectedItem = ayd.find((item) => item?.id === selectedAyd);

  // Export every delegate for the selected AYD by walking all pages (max
  // page size is 100), not just the page currently on screen.
  const handleExport = async () => {
    if (!selectedAyd || exporting) return;
    setExporting(true);
    try {
      const all = [];
      let page = 1;
      let pages = 1;
      do {
        const { items, pages: totalP } = await safeFetchPaginated(
          getAllAydDelegates,
          selectedAyd,
          { page, limit: 100 }
        );
        all.push(...items);
        pages = totalP;
        page += 1;
      } while (page <= pages);
      exportToExcel(decorate(all), "AYD Registered Delegates");
    } catch (error) {
      console.error("Error exporting delegates:", error);
    } finally {
      setExporting(false);
    }
  };

  const aydDropdownDisabled = aydLoading || !!aydError || ayd.length === 0;
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

      <div className="flex justify-end w-[80%] mx-auto mt-[1rem]">
        <button
          type="button"
          onClick={handleExport}
          disabled={!selectedAyd || exporting || totalItems === 0}
          className="bg-green text-white hover:bg-primary px-[2rem] py-[.5rem] rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exporting ? "Exporting…" : "Export to Excel"}
        </button>
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
        {delegatesLoading && decoratedDelegates.length === 0 ? (
          <div className="flex justify-center items-center my-[4rem]">
            <Loader big />
          </div>
        ) : delegateError ? (
          <div className="text-center my-[2rem]">
            <p className="text-red-600">{delegateError}</p>
            <button
              type="button"
              onClick={() => fetchDelegates(currentPage, pageSize)}
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
          <>
            <div className="w-[90%] mx-auto mt-[2.5rem] overflow-x-auto">
              <table className="w-full min-w-[640px] border">
                <thead>
                  <tr className="border-b text-xs sm:text-sm md:text-base">
                    <th className="py-[.5rem] w-[50px]">S/N</th>
                    <th className="py-[.5rem]">First Name</th>
                    <th className="py-[.5rem]">Last Name</th>
                    <th className="py-[.5rem]">Email</th>
                    <th className="py-[.5rem]">Parish</th>
                    <th className="py-[.5rem]">Deanery</th>
                  </tr>
                </thead>
                <tbody>
                  {decoratedDelegates.map((item, index) => (
                    <tr
                      className="text-center text-xs sm:text-sm md:text-base"
                      key={item.id || index}
                    >
                      <td className="border py-[.5rem]">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="border py-[.5rem] px-2">
                        {item?.firstName}
                      </td>
                      <td className="border py-[.5rem] px-2">
                        {item?.lastName}
                      </td>
                      <td className="border py-[.5rem] px-2">{item?.email}</td>
                      <td className="border py-[.5rem] px-2">
                        {item?.parishName}
                      </td>
                      <td className="border py-[.5rem] px-2">
                        {item?.deaneryName}
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
              disabled={delegatesLoading}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ViewAYD;
