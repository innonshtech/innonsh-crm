const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, 'innonsh-crm website v2.html');
const jsxFilePath = path.join(__dirname, 'src', 'components', 'LandingPage.jsx');
const cssFilePath = path.join(__dirname, 'src', 'components', 'LandingPage.css');

const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Extract CSS
const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  let css = styleMatch[1];
  fs.mkdirSync(path.dirname(cssFilePath), { recursive: true });
  fs.writeFileSync(cssFilePath, css);
}

// Extract Body
const bodyMatch = htmlContent.match(/<body>([\s\S]*?)<\/body>/);
if (bodyMatch) {
  let body = bodyMatch[1];

  // Convert HTML to JSX
  body = body.replace(/class=/g, 'className=');
  body = body.replace(/for=/g, 'htmlFor=');
  body = body.replace(/tabindex=/g, 'tabIndex=');
  body = body.replace(/viewbox=/gi, 'viewBox=');
  body = body.replace(/stroke-width=/g, 'strokeWidth=');
  body = body.replace(/stroke-linecap=/g, 'strokeLinecap=');
  body = body.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  body = body.replace(/fill-rule=/g, 'fillRule=');
  body = body.replace(/clip-rule=/g, 'clipRule=');
  body = body.replace(/stroke-miterlimit=/g, 'strokeMiterlimit=');
  body = body.replace(/stroke-dasharray=/g, 'strokeDasharray=');
  body = body.replace(/stroke-dashoffset=/g, 'strokeDashoffset=');
  body = body.replace(/stroke-opacity=/g, 'strokeOpacity=');
  body = body.replace(/fill-opacity=/g, 'fillOpacity=');
  
  // Convert style="..." to style={{...}}
  body = body.replace(/style="([^"]+)"/g, (match, styleString) => {
    const styles = styleString.split(';').filter(s => s.trim() !== '');
    const styleObj = styles.map(s => {
      let [key, value] = s.split(':');
      if (!key || !value) return '';
      key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return `${key}: "${value.trim()}"`;
    }).filter(s => s !== '').join(', ');
    return `style={{${styleObj}}}`;
  });

  // Self closing tags (basic)
  body = body.replace(/<(img|input|br|hr)([^>]*?)(?<!\/)>/g, '<$1$2 />');
  
  // The JS inside the HTML (the script tag at the end) needs to be removed or adapted.
  body = body.replace(/<script>([\s\S]*?)<\/script>/, '');

  // Convert HTML comments to JSX comments
  body = body.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  const jsxTemplate = `"use client";
import React, { useEffect } from 'react';
import './LandingPage.css';

export default function LandingPage() {
  useEffect(() => {
    // Add logic here from the original script if needed
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

    const handleScroll = () => {
      if(window.scrollY > 50) header?.classList.add('scrolled');
      else header?.classList.remove('scrolled');
    };

    const toggleMenu = () => {
      burger?.classList.toggle('open');
      mobileMenu?.classList.toggle('open');
    };

    window.addEventListener('scroll', handleScroll);
    burger?.addEventListener('click', toggleMenu);

    // Reveal animations
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
      const wh = window.innerHeight;
      reveals.forEach(r => {
        const rect = r.getBoundingClientRect();
        if(rect.top < wh - 50) r.classList.add('show');
      });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // trigger initially

    return () => {
      window.removeEventListener('scroll', handleScroll);
      burger?.removeEventListener('click', toggleMenu);
      window.removeEventListener('scroll', revealOnScroll);
    };
  }, []);

  return (
    <div className="landing-page-container">
      ${body}
    </div>
  );
}
`;

  fs.writeFileSync(jsxFilePath, jsxTemplate);
  console.log('Conversion successful!');
} else {
  console.log('Body not found in HTML');
}
