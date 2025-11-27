const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');

// Timeout for image fetch requests (in milliseconds)
const IMAGE_FETCH_TIMEOUT = 10000;

// Maximum length for text fields to prevent excessive content
const MAX_TEXT_LENGTH = 10000;

/**
 * Sanitizes text for safe use in PDF generation
 * Removes control characters and limits length
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
function sanitizeText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  // Remove control characters (except newlines and tabs)
  // eslint-disable-next-line no-control-regex
  let sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Limit length
  if (sanitized.length > MAX_TEXT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_TEXT_LENGTH) + '...';
  }
  return sanitized;
}

/**
 * Checks if a string is a valid IPv4 address
 * @param {string} ip - The string to check
 * @returns {boolean} - Whether it's a valid IPv4 address
 */
function isValidIPv4(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  
  for (const part of parts) {
    // Check that each part is a valid number (0-255)
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    if (num > 255) return false;
    // Check for leading zeros (which could be used for obfuscation), except for '0' itself
    if (part.length > 1 && part.startsWith('0')) return false;
  }
  return true;
}

/**
 * Checks if an IP address is in a private range
 * @param {string} ip - The IP address to check
 * @returns {boolean} - Whether the IP is private
 */
function isPrivateIP(ip) {
  if (!isValidIPv4(ip)) return false;
  
  const parts = ip.split('.').map(Number);
  
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  // 127.0.0.0/8 (loopback)
  if (parts[0] === 127) return true;
  
  // 169.254.0.0/16 (link-local)
  if (parts[0] === 169 && parts[1] === 254) return true;
  
  // 0.0.0.0/8 (current network)
  if (parts[0] === 0) return true;
  
  return false;
}

/**
 * Checks if a string contains IPv6 patterns (including bracketed notation)
 * @param {string} hostname - The hostname to check
 * @returns {boolean} - Whether it appears to be IPv6
 */
function isIPv6Pattern(hostname) {
  // Block any hostname containing colons (IPv6 indicator)
  // Also block bracketed IPv6 notation like [::1]
  if (hostname.includes(':')) return true;
  if (hostname.startsWith('[') && hostname.endsWith(']')) return true;
  return false;
}

/**
 * Validates a URL to ensure it's a valid HTTP/HTTPS URL and not targeting private networks
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
function isValidImageUrl(url) {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block local/private network hostnames
    const blockedHostnames = ['localhost', '0.0.0.0'];
    if (blockedHostnames.includes(hostname)) {
      return false;
    }
    
    // Block IPv6 addresses (including ::1 and other patterns)
    if (isIPv6Pattern(hostname)) {
      return false;
    }
    
    // Check if hostname is an IPv4 address and if it's private
    if (isValidIPv4(hostname)) {
      if (isPrivateIP(hostname)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Fetches an image from a URL and returns it as a buffer
 * @param {string} imageUrl - The URL of the image to fetch
 * @returns {Promise<Buffer>} - The image as a buffer
 */
async function fetchImageBuffer(imageUrl) {
  // Validate URL before fetching
  if (!isValidImageUrl(imageUrl)) {
    throw new Error('Invalid or disallowed image URL');
  }

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(imageUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = protocol.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch image: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    
    // Set timeout to prevent hanging
    request.setTimeout(IMAGE_FETCH_TIMEOUT, () => {
      request.destroy();
      reject(new Error('Image fetch timeout'));
    });
    
    request.on('error', reject);
  });
}

/**
 * Generates a Technical Report PDF for a Service Order
 * 
 * @param {string} orderId - The ID of the service order
 * @param {Object} prisma - Prisma client instance
 * @returns {Promise<Buffer>} - The PDF document as a buffer
 */
async function gerarRelatorio(orderId, prisma) {
  // Fetch service order data with client and photos
  const serviceOrder = await prisma.serviceOrder.findUnique({
    where: { id: orderId },
    include: {
      cliente: true,
      tecnico: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      photos: true,
    },
  });

  if (!serviceOrder) {
    throw new Error('Ordem de serviço não encontrada');
  }

  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Relatório Técnico - OS ${orderId}`,
      Author: 'Sistema de Gestão de Equipes Externas',
    },
  });

  // Collect PDF chunks
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Header with company logo placeholder
  // Draw a placeholder rectangle for logo
  doc.rect(50, 50, 100, 50).stroke();
  doc.fontSize(10).text('LOGO', 85, 70);
  
  // Company name and report title
  doc.fontSize(18).text('RELATÓRIO TÉCNICO', 160, 55, { align: 'left' });
  doc.fontSize(10).text('Sistema de Gestão de Equipes Externas', 160, 80, { align: 'left' });
  
  // Line separator
  doc.moveTo(50, 115).lineTo(545, 115).stroke();

  // Order Information Section
  doc.fontSize(14).text('Informações da Ordem de Serviço', 50, 130);
  doc.fontSize(10);
  doc.text(`OS ID: ${serviceOrder.id}`, 50, 155);
  doc.text(`Status: ${serviceOrder.status}`, 50, 170);
  doc.text(`Data Agendada: ${new Date(serviceOrder.dataAgendada).toLocaleDateString('pt-BR')}`, 50, 185);
  
  if (serviceOrder.dataInicio) {
    doc.text(`Data Início: ${new Date(serviceOrder.dataInicio).toLocaleDateString('pt-BR')} ${new Date(serviceOrder.dataInicio).toLocaleTimeString('pt-BR')}`, 50, 200);
  }
  if (serviceOrder.dataFim) {
    doc.text(`Data Conclusão: ${new Date(serviceOrder.dataFim).toLocaleDateString('pt-BR')} ${new Date(serviceOrder.dataFim).toLocaleTimeString('pt-BR')}`, 50, 215);
  }

  // Client Information Section
  let yPosition = serviceOrder.dataFim ? 245 : (serviceOrder.dataInicio ? 230 : 215);
  
  doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
  yPosition += 15;
  
  doc.fontSize(14).text('Dados do Cliente', 50, yPosition);
  yPosition += 25;
  
  doc.fontSize(10);
  doc.text(`Nome: ${sanitizeText(serviceOrder.cliente.nome)}`, 50, yPosition);
  yPosition += 15;
  doc.text(`Endereço: ${sanitizeText(serviceOrder.cliente.endereco)}`, 50, yPosition);
  yPosition += 15;
  doc.text(`Telefone: ${sanitizeText(serviceOrder.cliente.telefone)}`, 50, yPosition);
  yPosition += 15;
  doc.text(`Coordenadas: ${serviceOrder.cliente.latitude}, ${serviceOrder.cliente.longitude}`, 50, yPosition);
  yPosition += 25;

  // Technician Information Section
  doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
  yPosition += 15;
  
  doc.fontSize(14).text('Técnico Responsável', 50, yPosition);
  yPosition += 25;
  
  doc.fontSize(10);
  doc.text(`Nome: ${sanitizeText(serviceOrder.tecnico.nome)}`, 50, yPosition);
  yPosition += 15;
  doc.text(`Email: ${sanitizeText(serviceOrder.tecnico.email)}`, 50, yPosition);
  yPosition += 25;

  // Service Description Section
  doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
  yPosition += 15;
  
  doc.fontSize(14).text('Descrição do Serviço', 50, yPosition);
  yPosition += 25;
  
  doc.fontSize(10);
  const relatorioText = sanitizeText(serviceOrder.relatorioTecnico) || 'Nenhum relatório técnico registrado.';
  doc.text(relatorioText, 50, yPosition, {
    width: 495,
    align: 'justify',
  });
  
  // Calculate the height of the text to position photos correctly
  const textHeight = doc.heightOfString(relatorioText, { width: 495 });
  yPosition += textHeight + 25;

  // Photos Section - Before and After side by side
  if (serviceOrder.photos && serviceOrder.photos.length > 0) {
    // Check if we need a new page for photos
    if (yPosition > 550) {
      doc.addPage();
      yPosition = 50;
    }
    
    doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
    yPosition += 15;
    
    doc.fontSize(14).text('Fotos do Serviço', 50, yPosition);
    yPosition += 25;

    // Separate photos by type
    const fotoAntes = serviceOrder.photos.find((photo) => photo.tipo === 'ANTES');
    const fotoDepois = serviceOrder.photos.find((photo) => photo.tipo === 'DEPOIS');

    const photoWidth = 220;
    const photoHeight = 165;
    
    // Draw photo placeholders with labels
    if (fotoAntes || fotoDepois) {
      doc.fontSize(10);
      
      // Antes photo (left side)
      doc.text('ANTES', 50 + (photoWidth / 2) - 20, yPosition);
      yPosition += 15;
      
      if (fotoAntes) {
        try {
          const imageBuffer = await fetchImageBuffer(fotoAntes.url);
          doc.image(imageBuffer, 50, yPosition, {
            width: photoWidth,
            height: photoHeight,
            fit: [photoWidth, photoHeight],
          });
        } catch (error) {
          // If image fails to load, draw placeholder
          doc.rect(50, yPosition, photoWidth, photoHeight).stroke();
          doc.fontSize(8).text('Foto não disponível', 50 + 70, yPosition + 75);
        }
      } else {
        // No antes photo
        doc.rect(50, yPosition, photoWidth, photoHeight).stroke();
        doc.fontSize(8).text('Sem foto', 50 + 85, yPosition + 75);
      }

      // Depois photo (right side)
      doc.fontSize(10).text('DEPOIS', 295 + (photoWidth / 2) - 25, yPosition - 15);
      
      if (fotoDepois) {
        try {
          const imageBuffer = await fetchImageBuffer(fotoDepois.url);
          doc.image(imageBuffer, 295, yPosition, {
            width: photoWidth,
            height: photoHeight,
            fit: [photoWidth, photoHeight],
          });
        } catch (error) {
          // If image fails to load, draw placeholder
          doc.rect(295, yPosition, photoWidth, photoHeight).stroke();
          doc.fontSize(8).text('Foto não disponível', 295 + 70, yPosition + 75);
        }
      } else {
        // No depois photo
        doc.rect(295, yPosition, photoWidth, photoHeight).stroke();
        doc.fontSize(8).text('Sem foto', 295 + 85, yPosition + 75);
      }

      yPosition += photoHeight + 20;
    }
  }

  // Footer
  const pageHeight = 841.89; // A4 height in points
  doc.fontSize(8)
    .text(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
      50,
      pageHeight - 50,
      { align: 'center', width: 495 }
    );

  // Finalize PDF
  doc.end();

  // Return promise that resolves with the PDF buffer
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);
  });
}

module.exports = { gerarRelatorio };
