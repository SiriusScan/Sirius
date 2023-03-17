import React, { HtmlHTMLAttributes } from 'react';
import { CssBaseline, Container } from '@mui/material';
import { CoreLayoutProps } from 'react-admin';
import { ErrorBoundary } from 'react-error-boundary';

import { Error } from 'react-admin';
import Nav from './Nav';

const Layout = (props: LayoutProps) => {
    const { children } = props;
    return (
        <>
            <Container sx={{backgroundColor: '#eaeaea', height: '100vh'}}>
                <CssBaseline />
                <Nav />
                {/* @ts-ignore */}
                <Container sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    marginTop: 8, 
                }}>
                    <ErrorBoundary FallbackComponent={Error}>
                        {children}
                    </ErrorBoundary>
                </Container>
            </Container>
        </>
    );
};

export interface LayoutProps
    extends CoreLayoutProps,
        Omit<HtmlHTMLAttributes<HTMLDivElement>, 'title'> {}

export default Layout;