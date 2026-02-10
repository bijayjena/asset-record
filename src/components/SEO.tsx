import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
}

export const SEO = ({
    title = 'Asset Record',
    description = 'Detailed asset tracking and management application.',
    name = 'Asset Record',
    type = 'website'
}: SEOProps) => {
    const metaTitle = title === 'Asset Record' ? title : `${title} | Asset Record`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{metaTitle}</title>
            <meta name='description' content={description} />

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={description} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};
