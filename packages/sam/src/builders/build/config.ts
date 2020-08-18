import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { ExtendedBuildBuilderOptions } from './build';

/**
 * This entry-point is called by nrwl's builder, just before it calls out to webpack.
 * It allows us to customise the webpack build, while building on top of everything that
 * the nrwl building is already doing.
 *
 * We trigger this by setting options.webpackConfig to the path of this file in the builder.
 *
 */
export = (
    configFromNrwlNodeBuilder: Configuration,
    options: {
        options: ExtendedBuildBuilderOptions;
        configuration: string;
    }
) => {
    const config = merge(configFromNrwlNodeBuilder, getCustomWebpack());
    // override the entry with the entry determined in the builder
    config.entry = options.options.entry;
    // if the end-consumer provided their own function to customise the webpack config, run it
    const webpackConfig = options.options.originalWebpackConfig;
    if (webpackConfig) {
        const configFn = require(webpackConfig);
        return configFn(config, options);
    }
    return config;
};

function getCustomWebpack(): Configuration {
    return {
        output: {
            libraryTarget: 'commonjs',
            // we create each chunk in it's own directory: this makes it easy to upload independent packages
            filename: '[name].js',
        },
        // exclude the aws-sdk
        externals: [/^aws-sdk/],
        optimization: {
            minimize: false,
        },
    };
}
