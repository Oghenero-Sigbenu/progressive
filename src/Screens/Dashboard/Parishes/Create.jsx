"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import { fetchAllDeaneries, postParish } from "../../../Redux/Api";
import Loader from "../../../Components/Loader";
import { safeFetchList, apiErrorMessage } from "../../../helpers/api";
import { isEmpty, isValidEmail } from "../../../helpers/utils";

const initialSignUpData = {
  name: "",
  email: "",
  hasPaid: "",
  location: "",
  deaneryId: "",
};

const validateParish = (values) => {
  const errors = {};
  const trimmedName = values.name?.trim() || "";
  // const trimmedLocation = values.location?.trim() || "";

  if (isEmpty(trimmedName)) {
    errors.name = "Parish name is required.";
  } else if (trimmedName.length < 3) {
    errors.name = "Parish name must be at least 3 characters.";
  }

  if (isEmpty(values.deaneryId)) {
    errors.deaneryId = "Please select a deanery.";
  }

  if (!isEmpty(values.email) && !isValidEmail(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (
    values.hasPaid === "" ||
    values.hasPaid === null ||
    values.hasPaid === undefined
  ) {
    errors.hasPaid = "Please choose the AYD payment status.";
  }

  // Address/location is now optional, so no validation required.

  return errors;
};

const CreateParish = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [deaneries, setDeaneries] = useState([]);
  const [loadingDeaneries, setLoadingDeaneries] = useState(false);
  const [deaneryError, setDeaneryError] = useState(null);
  const [signUpData, setSignUpData] = useState(initialSignUpData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextSignUpData = {
      ...signUpData,
      [name]: value,
    };

    setShow(false);
    setSubmitError("");
    setSignUpData(nextSignUpData);

    if (touched[name] || errors[name]) {
      const validationErrors = validateParish(nextSignUpData);
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name],
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const nextTouched = {
      ...touched,
      [name]: true,
    };
    const validationErrors = validateParish({
      ...signUpData,
      [name]: value,
    });

    setTouched(nextTouched);
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name],
    }));
  };

  const isFieldInvalid = (fieldName) => {
    return Boolean(touched[fieldName] && errors[fieldName]);
  };

  const resetForm = () => {
    setSignUpData(initialSignUpData);
    setErrors({});
    setTouched({});
  };

  const buildPayload = () => {
    const payload = {
      ...signUpData,
      name: signUpData.name.trim(),
      location: signUpData.location.trim(),
      hasPaid: Number(signUpData.hasPaid),
    };
    // Only include email if it is not empty after trimming
    const trimmedEmail = signUpData.email.trim();
    if (trimmedEmail) {
      payload.email = trimmedEmail;
    } else {
      delete payload.email;
    }
    return payload;
  };

  const fieldIds = {
    name: "parish-name-error",
    email: "parish-email-error",
    deaneryId: "parish-deanery-error",
    hasPaid: "parish-payment-error",
    location: "parish-location-error",
  };

  const handleCreateParish = async (e) => {
    e.preventDefault();

    const payload = buildPayload();
    const validationErrors = validateParish(payload);

    setTouched({
      name: true,
      email: true,
      deaneryId: true,
      hasPaid: true,
      location: true,
    });
    setErrors(validationErrors);
    setShow(false);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await postParish(payload);
      if (data) {
        setShow(true);
        resetForm();
      } else {
        setSubmitError("Could not create parish.");
      }
    } catch (err) {
      setSubmitError(apiErrorMessage(err, "Could not create parish."));
      console.error("Error creating parish:", err.response || err);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchAllDeanery();
  }, []);

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] bg-white">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"Create Parish"}
        />
      </div>

      <div>
        <form
          className="w-[97%] my-[2rem] px-[1rem] mx-auto"
          onSubmit={handleCreateParish}
          noValidate
        >
          <div className="flex flex-wrap justify-between">
            <div className="mt-[18px] w-full md:w-[49%]">
              <label className="mb-[15px] text-[.8rem]">
                Name <span className="text-red-600">*</span>
              </label>
              <div
                className={`w-full flex rounded-[10px] shadow-sm mt-[.5rem] h-[54px] justify-between items-center border ${
                  isFieldInvalid("name")
                    ? "border-red-500"
                    : "border-transparent"
                }`}
              >
                <input
                  name="name"
                  className="w-full border-none rounded-[10px] outline-none h-full px-[22px]"
                  value={signUpData.name}
                  placeholder="St. John Catholic Church, Ado"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={isFieldInvalid("name")}
                  aria-describedby={
                    isFieldInvalid("name") ? fieldIds.name : undefined
                  }
                />
              </div>
              {isFieldInvalid("name") && (
                <p id={fieldIds.name} className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="mt-[18px] w-full md:w-[49%]">
              <label className="mb-[15px] text-[.8rem]">Email</label>
              <div
                className={`w-full flex rounded-[10px] shadow-sm mt-[.5rem] h-[54px] justify-between items-center border ${
                  isFieldInvalid("email")
                    ? "border-red-500"
                    : "border-transparent"
                }`}
              >
                <input
                  name="email"
                  type="email"
                  className="w-full border-none rounded-[10px] outline-none h-full px-[22px]"
                  value={signUpData.email}
                  placeholder="parish@email.com"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={isFieldInvalid("email")}
                  aria-describedby={
                    isFieldInvalid("email") ? fieldIds.email : undefined
                  }
                />
              </div>
              {isFieldInvalid("email") && (
                <p id={fieldIds.email} className="mt-1 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-between">
            <div className="mt-[18px] w-full md:w-[49%]">
              <label className="mb-[15px] text-[.8rem]">
                Deanery <span className="text-red-600">*</span>
              </label>
              <div
                className={`w-full flex rounded-[10px] shadow-sm mt-[.5rem] h-[54px] justify-between items-center border ${
                  isFieldInvalid("deaneryId")
                    ? "border-red-500"
                    : "border-transparent"
                }`}
              >
                <select
                  name="deaneryId"
                  className="w-full border-none rounded-[10px] outline-none h-full px-[22px] disabled:opacity-60"
                  value={signUpData.deaneryId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={
                    loadingDeaneries || !!deaneryError || deaneries.length === 0
                  }
                  aria-invalid={isFieldInvalid("deaneryId")}
                  aria-describedby={
                    isFieldInvalid("deaneryId") ? fieldIds.deaneryId : undefined
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
              {isFieldInvalid("deaneryId") && (
                <p
                  id={fieldIds.deaneryId}
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.deaneryId}
                </p>
              )}
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
              <label className="mb-[15px] text-[.8rem]">
                AYD Payment <span className="text-red-600">*</span>
              </label>
              <div
                className={`w-full flex rounded-[10px] shadow-sm mt-[.5rem] h-[54px] justify-between items-center border ${
                  isFieldInvalid("hasPaid")
                    ? "border-red-500"
                    : "border-transparent"
                }`}
              >
                <select
                  name="hasPaid"
                  className="w-full border-none rounded-[10px] outline-none h-full px-[22px]"
                  value={signUpData.hasPaid}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={isFieldInvalid("hasPaid")}
                  aria-describedby={
                    isFieldInvalid("hasPaid") ? fieldIds.hasPaid : undefined
                  }
                >
                  <option value="">Select payment status</option>
                  <option value={1}>True</option>
                  <option value={0}>False</option>
                </select>
              </div>
              {isFieldInvalid("hasPaid") && (
                <p id={fieldIds.hasPaid} className="mt-1 text-xs text-red-600">
                  {errors.hasPaid}
                </p>
              )}
            </div>

            <div className="mt-[18px] w-full md:w-[49%]">
              <label className="mb-[15px] text-[.8rem]">Address</label>
              <div
                className={`w-full flex rounded-[10px] shadow-sm mt-[.5rem] h-[54px] justify-between items-center border ${
                  isFieldInvalid("location")
                    ? "border-red-500"
                    : "border-transparent"
                }`}
              >
                <input
                  name="location"
                  className="w-full border-none rounded-[10px] outline-none h-full px-[22px]"
                  value={signUpData.location}
                  placeholder="Enter address"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={isFieldInvalid("location")}
                  aria-describedby={
                    isFieldInvalid("location") ? fieldIds.location : undefined
                  }
                />
              </div>
              {isFieldInvalid("location") && (
                <p id={fieldIds.location} className="mt-1 text-xs text-red-600">
                  {errors.location}
                </p>
              )}
            </div>
          </div>
          {submitError && (
            <h4 className="mt-[2rem] text-red-600 text-center">
              {submitError}
            </h4>
          )}
          {show && (
            <h4 className="mt-[2rem] text-green text-center">
              Parish Successfully Created!
            </h4>
          )}

          <div
            className={`flex md:w-[400px] mx-auto justify-center items-center h-[48px] mt-[3rem] rounded-[5px] text-white ${
              loading ? "bg-[#b9b8b8]" : "bg-green"
            }`}
          >
            <button
              type="submit"
              disabled={loading}
              className="border-none outline-none cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? <Loader /> : "CREATE"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateParish;
