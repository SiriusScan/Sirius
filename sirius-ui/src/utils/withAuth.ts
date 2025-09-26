import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import { isAuthenticated, type AuthSession } from "~/utils/auth";

/**
 * Enhanced authentication wrapper for pages
 * Supports custom redirects and additional props
 */
interface WithAuthOptions {
  redirectTo?: string;
  returnUrl?: boolean;
}

/**
 * Higher-order function to protect pages with server-side authentication
 * @param getServerSidePropsFunc - Optional function to run after auth check
 * @param options - Configuration options
 */
export const withAuth = (
  getServerSidePropsFunc?: (
    context: GetServerSidePropsContext,
    session: AuthSession
  ) => Promise<any>,
  options: WithAuthOptions = {}
): GetServerSideProps => {
  return async (context) => {
    const session = await getServerAuthSession(context);
    const { redirectTo = "/", returnUrl = true } = options;

    if (!isAuthenticated(session)) {
      let destination = redirectTo;

      // Add return URL if enabled
      if (returnUrl && context.resolvedUrl !== redirectTo) {
        const returnParam = encodeURIComponent(context.resolvedUrl);
        destination = `${redirectTo}?return=${returnParam}`;
      }

      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    // If custom getServerSideProps function is provided, call it
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

/**
 * Simple authentication wrapper - just checks auth without additional logic
 */
export const requireAuth: GetServerSideProps = withAuth();

/**
 * Wrapper for admin-only pages (can be extended for role-based auth)
 */
export const withAdminAuth = (
  getServerSidePropsFunc?: (
    context: GetServerSidePropsContext,
    session: AuthSession
  ) => Promise<any>
) => {
  return withAuth(async (context, session) => {
    // TODO: Add role-based checking here when roles are implemented
    // For now, any authenticated user can access admin pages

    if (getServerSidePropsFunc) {
      return getServerSidePropsFunc(context, session);
    }

    return {
      props: {
        session,
      },
    };
  });
};

export default withAuth;
