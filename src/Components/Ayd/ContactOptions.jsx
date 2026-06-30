"use client";

import { AnimatePresence, motion } from "framer-motion";
import { isEmpty } from "../../helpers/utils";
import Controls from "./Controls";
import { SelectField, TextField } from "./FormField";
import StepShell from "./StepShell";
import { useState } from "react";
import { aydDelegateRegistration } from "../../Redux/Api";
import { apiErrorMessage } from "../../helpers/api";

const ContactOptions = ({
  requestData,
  goBack,
  next,
  onChange,
  start,
  isValidNumber,
  isValid,
}) => {
  const { phoneNumber, email, gender } = requestData;
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const phoneStr = String(phoneNumber ?? "");
  const disableBtn = phoneStr.length === 0 || isEmpty(email) || isEmpty(gender);

  const submitRequest = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      const { data } = await aydDelegateRegistration(requestData);
      if (data) {
        setLoading(false);
        next();
      }
    } catch (error) {
      setLoading(false);
      setSubmitError(
        apiErrorMessage(
          error,
          "We couldn't complete your registration. Please try again.",
        ),
      );
      console.error("Error fetching data:", error.response);
    }
  };

  return (
    <StepShell
      eyebrow="Almost there"
      title="Contact information"
      subtitle="We'll use these details to confirm your registration."
    >
      <TextField
        label="Phone number"
        required
        type="tel"
        inputMode="text"
        name="phoneNumber"
        value={phoneNumber}
        onChange={onChange}
        placeholder="08000000000"
        autoComplete="tel"
        error={
          phoneStr.length > 0 && isValidNumber === false
            ? "Enter a valid 10-digit phone number"
            : ""
        }
      />
      <TextField
        label="Email"
        required
        type="email"
        name="email"
        value={email}
        onChange={onChange}
        placeholder="you@example.com"
        autoComplete="email"
        error={
          !isEmpty(email) && isValid === false
            ? "Enter a valid email address"
            : ""
        }
        className="lowercase"
      />
      <SelectField
        label="Gender"
        required
        name="gender"
        value={gender}
        onChange={onChange}
      >
        <option value="" disabled>
          Select gender…
        </option>
        <option value="Female">Female</option>
        <option value="Male">Male</option>
      </SelectField>

      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger-bg px-4 py-3 text-sm text-danger"
          >
            <svg
              className="h-5 w-5 flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{submitError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Controls
        loading={loading}
        goBack={goBack}
        next={next}
        start={start}
        end={true}
        handleSubmit={submitRequest}
        disable={disableBtn}
      />
    </StepShell>
  );
};

export default ContactOptions;
