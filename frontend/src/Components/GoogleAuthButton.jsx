import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const GoogleAuthButton = ({ onSuccess, onError }) => {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          useOneTap
          render={renderProps => (
            <button
              type="button"
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className="flex items-center justify-center w-full bg-red-700 text-white px-7 py-3 uppercase text-sm font-medium hover:bg-red-800 active:bg-red-900 shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out rounded"
            >
              <FcGoogle className="text-2xl bg-white rounded-full mr-2" />
              Continue with Google
            </button>
          )}
        />
      </div>
    </div>
  );
};

export default GoogleAuthButton;
