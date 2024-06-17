import React from "react";
import { ThreeDots } from "react-loader-spinner";
import "../assets/styles/FullPageLoader.scss";

const FullPageLoader = () => {
  return (
    <div className="full-page-loader">
      <ThreeDots height="80" width="80" radius="9" color="white" ariaLabel="three-dots-loading" wrapperStyle={{}} visible={true} />
    </div>
  );
};

export default FullPageLoader;
