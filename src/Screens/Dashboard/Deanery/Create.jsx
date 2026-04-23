"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../Components/Dashboard/DashboardLayout";
import TitleNav from "../../../Components/Dashboard/Title";
import { postDeanery } from "../../../Redux/Api";
import Loader from "../../../Components/Loader";
import { apiErrorMessage } from "../../../helpers/api";
import { isEmpty } from "../../../helpers/utils";

const initialDeaneryData = {
  name: "",
};

const validateDeanery = (values) => {
  const errors = {};
  const trimmedName = values.name?.trim() || "";

  if (isEmpty(trimmedName)) {
    errors.name = "Deanery name is required.";
  } else if (trimmedName.length < 3) {
    errors.name = "Deanery name must be at least 3 characters.";
  }

  return errors;
};

const CreateDeanery = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [deaneryData, setDeaneryData] = useState(initialDeaneryData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextDeaneryData = {
      ...deaneryData,
      [name]: value,
    };

    setShow(false);
    setSubmitError("");
    setDeaneryData(nextDeaneryData);

    if (touched[name] || errors[name]) {
      const validationErrors = validateDeanery(nextDeaneryData);
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
    const validationErrors = validateDeanery({
      ...deaneryData,
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
    setDeaneryData(initialDeaneryData);
    setErrors({});
    setTouched({});
  };

  const buildPayload = () => ({
    name: deaneryData.name.trim(),
  });

  const handleCreateDeanery = async (e) => {
    e.preventDefault();

    const payload = buildPayload();
    const validationErrors = validateDeanery(payload);

    setTouched({
      name: true,
    });
    setErrors(validationErrors);
    setShow(false);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await postDeanery(payload);
      if (data) {
        setShow(true);
        resetForm();
      } else {
        setSubmitError("Could not create deanery.");
      }
    } catch (error) {
      setSubmitError(apiErrorMessage(error, "Could not create deanery."));
      console.error("Error creating deanery:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="sticky top-0 z-[20] bg-white">
        <TitleNav
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          pathname={"Create Deanery"}
        />
      </div>

      <div>
        <form
          className="w-[97%] my-[2rem] px-[1rem] mx-auto"
          onSubmit={handleCreateDeanery}
          noValidate
        >
          <div className="flex flex-wrap justify-between">
            <div className="mt-[18px] w-full ">
              <label className="mb-[15px] text-[.8rem]">
                Name <span className="text-red-600">*</span>
              </label>
              <div
                className={`w-full flex rounded-[10px] shadow-sm mt-[.5rem] h-[54px] justify-between items-center border ${
                  isFieldInvalid("name") ? "border-red-500" : "border-transparent"
                }`}
              >
                <input
                  name="name"
                  className="w-full border-none rounded-[10px] outline-none h-full px-[22px]"
                  value={deaneryData.name}
                  placeholder="St. John Catholic Church, Ado"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={isFieldInvalid("name")}
                  aria-describedby={
                    isFieldInvalid("name") ? "deanery-name-error" : undefined
                  }
                />
              </div>
              {isFieldInvalid("name") && (
                <p
                  id="deanery-name-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          {submitError && (
            <h4 className="mt-[2rem] text-red-600 text-center">{submitError}</h4>
          )}

          {show && (
            <h4 className="mt-[2rem] text-green text-center">
              Deanery Successfully Created!
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

export default CreateDeanery;
