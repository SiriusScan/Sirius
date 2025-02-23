import React, { useEffect, useState } from "react";
import Layout from "~/components/Layout";

type Props = {};

const Scanner = (props: Props) => {
  return (
    <Layout>
      <div className="relative z-20 mb-5 h-56">
        <div className="z-10 flex flex-row items-center">
          <div className="ml-4 mt-7 flex dark:fill-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              strokeWidth="1"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M20 18a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
              <path d="M8 18a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
              <path d="M8 6a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
              <path d="M20 6a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
              <path d="M14 12a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z"></path>
              <path d="M6 8v8"></path>
              <path d="M18 16v-8"></path>
              <path d="M8 6h8"></path>
              <path d="M16 18h-8"></path>
              <path d="M7.5 7.5l3 3"></path>
              <path d="M13.5 13.5l3 3"></path>
              <path d="M16.5 7.5l-3 3"></path>
              <path d="M10.5 13.5l-3 3"></path>
            </svg>
          </div>
          <h1 className="ml-3 mt-5 flex text-4xl font-extralight ">Scanner</h1>
        </div>
      </div>
    </Layout>
  );
};

export default Scanner;
