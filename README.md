<!-- Improved compatibility of back to top link: See: https://github.com/j113203/swagger-client-generator/pull/73 -->
<a name="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/j113203/swagger-client-generator">
  </a>

  <h3 align="center">Swagger Client</h3>

  <p align="center">
    An object-oriented axios client generate by swagger
    <br />
    <a href="https://github.com/j113203/swagger-client-generator"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/j113203/swagger-client-generator">View Demo</a>
    ·
    <a href="https://github.com/j113203/swagger-client-generator/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/j113203/swagger-client-generator/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

In modern software development, integrating and maintaining consistent communication between backend services and frontend/mobile applications is crucial. To streamline this process, our project introduces an innovative solution: an automated SDK generator designed specifically for backend teams. This tool leverages the power of Swagger (OpenAPI) specifications to generate NPM packages that serve as SDKs. These SDKs facilitate seamless integration for frontend and mobile teams, promoting efficiency and reducing manual coding efforts.

#### Key Features
##### Automated SDK Generation:
The core functionality of our project is to automatically generate a Node.js SDK during the CI/CD pipeline.
By utilizing Swagger JSON specifications, the generator creates clean, lightweight, and maintainable code.

##### CI/CD Integration:
The generator integrates seamlessly with CI/CD pipelines, ensuring that SDKs are up-to-date with the latest API changes.
This automation reduces the need for manual intervention and ensures consistency across development environments.

##### Multi-Platform Support:
The generated SDK is designed to be versatile, supporting usage in both frontend and mobile development environments.
It is compatible with any project that uses Node.js, making it a robust solution for various development teams.

##### Clean and Lightweight Code:
The SDK generator emphasizes producing clean, readable, and efficient code.
This focus ensures that the SDK is easy to integrate, extend, and maintain.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Vue][Vue.js]][Vue-url]
* [![Angular][Angular.io]][Angular-url]
* [![Svelte][Svelte.dev]][Svelte-url]
* [![Laravel][Laravel.com]][Laravel-url]
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![JQuery][JQuery.com]][JQuery-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. create a swagger.ts
```javascript
 const generater = new SwaggerGenerator();
  await generater
    .setOpenApiSpecificationUrl(
      "https://xxx.json"
    )
    .setName("MobileApi")
    .buildAsync();
```
2. run the swagger file
```bash
npx ts-node -O '{\"module\":\"commonjs\"}' test/Startup.ts
```
3. then the client will locale in the project direcotry (/api)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage
the client will generate like
```javascript
export class MobileApiClient {

	get axios(): AxiosInstance;

	get aIDiagnostic(): IAIDiagnosticClient;
	
}
```
you can use the client in your code like below, you should init the client instance in your framework recommand. like init the client as provider in react.js
```javascript
const client = new MobileApiClient().

const data = await client.heallthrecord.bloodpressure.listAsync({});
```

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Generate Response Result
- [x] Support Request Path Parameter
- [x] Support Request Query Parameter
- [ ] Support Request Body Parameter

See the [open issues](https://github.com/j113203/swagger-client-generator/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Jack Wong - [@j113203](https://github.com/j113203) - jack.wong@j1.business

Project Link: [https://github.com/j113203/swagger-client-generator](https://github.com/j113203/swagger-client-generator)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

[openapi3-ts](https://github.com/metadevpro/openapi3-ts)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/j113203/swagger-client-generator.svg?style=for-the-badge
[contributors-url]: https://github.com/j113203/swagger-client-generator/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/j113203/swagger-client-generator.svg?style=for-the-badge
[forks-url]: https://github.com/j113203/swagger-client-generator/network/members
[stars-shield]: https://img.shields.io/github/stars/j113203/swagger-client-generator.svg?style=for-the-badge
[stars-url]: https://github.com/j113203/swagger-client-generator/stargazers
[issues-shield]: https://img.shields.io/github/issues/j113203/swagger-client-generator.svg?style=for-the-badge
[issues-url]: https://github.com/j113203/swagger-client-generator/issues
[license-shield]: https://img.shields.io/github/license/j113203/swagger-client-generator.svg?style=for-the-badge
[license-url]: https://github.com/j113203/swagger-client-generator/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/ka-wa-wong-029706171/
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 