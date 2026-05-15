// ImageAnalyseRepository.java
package com.oncoassist.oncoassist.repository;

import com.oncoassist.oncoassist.model.entity.ImageAnalyse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ImageAnalyseRepository extends JpaRepository<ImageAnalyse, UUID> {}