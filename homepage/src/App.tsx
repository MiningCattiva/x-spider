/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import iconDownload from './icons/download.svg';

function App() {
  const [sponsors, setSponsors] = useState<any>(null);

  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/MiningCattiva/sponsors/main/sponsors.json',
    )
      .then((resp) => {
        return resp.json();
      })
      .then((data) => {
        setSponsors(data);
      });
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="pb-16">
        <div className="bg-[linear-gradient(45deg,#1d9bf0,#1dc6f0)] text-white ">
          <header className="p-4 flex items-center justify-between absolute w-full top-0">
            <section>
              <a
                href="https://miningcattiva.github.io/x-spider"
                className="flex items-center"
              >
                <img
                  className="w-10 mr-1"
                  src="https://github.com/MiningCattiva/x-spider/blob/master/src-tauri/icons/128x128.png?raw=true"
                />
                <span className="font-bold">X-Spider</span>
              </a>
            </section>
            <nav className="font-bold [&_a]:hover:opacity-80 [&_a]:transition-all">
              <ul className="space-x-2 flex items-center">
                <li>
                  <a
                    href="https://github.com/MiningCattiva/x-spider"
                    target="_blank"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </nav>
          </header>
          <section className="h-[70vh] px-8 flex justify-center items-center min-h-[30rem] max-h-[40rem]">
            <div className="flex flex-col items-center lg:items-start">
              <h1 className="font-bold text-4xl">X-Spider</h1>
              <p className="mt-2 text-center">速度超快的开源推特媒体下载器</p>
              <ul className="mt-3 flex space-x-2 justify-center">
                <li>
                  <a
                    href="https://github.com/MiningCattiva/x-spider/releases"
                    target="_blank"
                  >
                    <img src="https://img.shields.io/github/v/release/MiningCattiva/x-spider?label=%E7%89%88%E6%9C%AC" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/MiningCattiva/x-spider/releases"
                    target="_blank"
                  >
                    <img src="https://img.shields.io/github/downloads/MiningCattiva/x-spider/total?style=flat&label=%E4%B8%8B%E8%BD%BD%E6%95%B0" />
                  </a>
                </li>
                <li>
                  <img src="https://img.shields.io/badge/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F-Windows-yellow" />
                </li>
                <li>
                  <a href="https://afdian.net/a/moyuscript" target="_blank">
                    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgithub.com%2FMiningCattiva%2Fsponsors%2Fraw%2Fmain%2Fsponsors.json&query=%24.count&suffix=%E4%BA%BA&label=%E7%88%B1%E5%8F%91%E7%94%B5&color=%23926be5" />
                  </a>
                </li>
              </ul>
              <a
                className="bg-white rounded-md hover:scale-105 transition-all text-black flex items-center mt-8 px-4 py-2"
                href="https://github.com/MiningCattiva/x-spider/releases"
                target="_blank"
              >
                <span>
                  <img src={iconDownload} className="w-4" />
                </span>
                <span className="flex flex-col ml-2">
                  <span className="text-sm">前往下载</span>
                </span>
              </a>
            </div>
            <div className="hidden lg:block ml-20 [perspective:500px]">
              <img
                className="w-72 shadow-2xl transition-all duration-700 [transform:rotateY(-20deg)] hover:[transform:rotateY(-15deg)]"
                src="https://github.com/MiningCattiva/x-spider/blob/master/assets/screenshot-homepage.jpg?raw=true"
              />
            </div>
          </section>
        </div>
        <section className="px-4 py-8 text-gray-800 flex flex-col pb-40 items-center">
          <h1 className="font-bold text-3xl">软件特性</h1>
          <ul className="mt-10 grid text-center lg:text-left lg:grid-cols-2 gap-4 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mb-2 [&_li]:border-[1px] [&_li]:border-gray-300 [&_li]:p-4 [&_li]:rounded-md [&_li]:bg-white">
            <li>
              <h2>速度飞快</h2>
              <p>基于 Aria2 进行下载，能充分利用带宽。</p>
            </li>
            <li>
              <h2>下载过滤器</h2>
              <p>可配置下载指定日期范围、指定资源类型等的资源。</p>
            </li>
            <li>
              <h2>跳过已下载文件</h2>
              <p>存在同名文件时，自动跳过下载。</p>
            </li>
            <li>
              <h2>可配置文件名模板</h2>
              <p>可使用各种变量（如用户名、发布日期等）来配置文件名模板。</p>
            </li>
            <li>
              <h2>代理</h2>
              <p>可使用 HTTP 代理来连接或下载。</p>
            </li>
            <li>
              <h2>Cookie 登录</h2>
              <p>使用 Cookie 来登录你的推特账号。</p>
            </li>
          </ul>
        </section>
        <section className="bg-[#916ae4] text-white flex px-4 py-8 pb-40 flex-col items-center">
          <h1 className="font-bold text-3xl">赞助名单</h1>
          <p className="mt-8">
            <a
              href="https://afdian.net/a/moyuscript"
              target="_blank"
              className="flex items-center border-2 px-4 py-2 rounded-md transition-all hover:scale-105"
            >
              <img
                src="https://afdian.net/static/img/logo/afdian_logo.png"
                className="w-6"
              />
              <span className="ml-2">爱发电</span>
            </a>
          </p>
          <p className="mt-8">非常感谢以下大佬对本软件的赞助</p>
          {sponsors ? (
            <ul className="mt-8 flex flex-wrap justify-center">
              {sponsors.list.map((item: any) => (
                <li key={item.id} className='flex items-center mb-4 mx-2'>
                  <img src={item.avatar} className="w-6 rounded-full" />
                  <span className='ml-1'>{item.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4">加载中...</p>
          )}
        </section>
      </div>
      <footer className="bg-gray-800 text-white absolute w-full h-16 bottom-0 flex items-center justify-center">
        版权所有 © 2024 X-Spider
      </footer>
    </div>
  );
}

export default App;
