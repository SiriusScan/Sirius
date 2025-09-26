import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import { isAuthenticated, type AuthSession } from "~/utils/auth";

/**
 * Server-side authentication utilities
 * This file should only be imported in server-side code
 */

/**
 * Higher-order function to protect pages with authentication
 * This is a server-side authentication wrapper
 */
export const withAuth = (
  getServerSidePropsFunc?: (
    context: GetServerSidePropsContext,
    session: AuthSession
  ) => Promise<any>
) => {
  return async (context: GetServerSidePropsContext) => {
    const session = await getServerAuthSession(context);

    if (!isAuthenticated(session)) {
      let destination = "/";

      // Add return URL if current URL is not the login page
      if (context.resolvedUrl !== "/") {
        const returnParam = encodeURIComponent(context.resolvedUrl);
        destination = `/?return=${returnParam}`;
      }

      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    if (getServerSidePropsFunc) {
      try {
        const result = await getServerSidePropsFunc(context, session);

        // Merge session into props if result has props
        if (result.props) {
          result.props.session = session;
        }

        return result;
      } catch (error) {
        console.error("Error in withAuth getServerSidePropsFunc:", error);

        // Return error page or redirect on error
        return {
          redirect: {
            destination: "/error",
            permanent: false,
          },
        };
      }
    }

    return {
      props: {
        session,
      },
    };
  };
};
