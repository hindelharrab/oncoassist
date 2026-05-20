package com.oncoassist.oncoassist.service;

import com.oncoassist.oncoassist.model.dto.mammographie.MammographieResultDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Transactional(readOnly = true)
public class AiInferenceService {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public AiInferenceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public MammographieResultDTO analyze(MultipartFile image)
            throws IOException {

        // Préparer les headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // Préparer le body avec l'image
        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();
        body.add("file",
                new ByteArrayResource(image.getBytes()) {
                    @Override
                    public String getFilename() {
                        return image.getOriginalFilename();
                    }
                }
        );

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        // Appel vers FastAPI Python
        ResponseEntity<MammographieResultDTO> response =
                restTemplate.postForEntity(
                        aiServiceUrl + "/predict",
                        request,
                        MammographieResultDTO.class
                );

        return response.getBody();
    }
}