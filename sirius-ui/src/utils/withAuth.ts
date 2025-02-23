import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

const withAuth: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default withAuth; 